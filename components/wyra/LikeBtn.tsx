"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";
import { isNotificationAllowed } from "@/utils/helper";

interface LikeButtonProps {
  wyraId: string;
  userId: string | undefined;
  isFloatAllow?: any;
  count?: any;
  isDisabled?: any;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  wyraId,
  userId,
  isFloatAllow,
  count,
  isDisabled,
}) => {
  const [liked, setLiked] = useState(false);
  const [showAgree, setShowAgree] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const supabase = createClient();

  const fetchReaction = async () => {
    const { data } = await supabase
      .from("wyra_reaction")
      .select("type")
      .eq("wyra_id", wyraId)
      .eq("user_id", userId)
      .eq("type", "like")
      .maybeSingle();
    setLiked(data?.type === "like");

    const { count } = await supabase
      .from("wyra_reaction")
      .select("*", { count: "exact", head: true })
      .eq("wyra_id", wyraId)
      .eq("type", "like");

    setLikesCount(count || 0);
  };
  // ✅ Fetch initial like status
  useEffect(() => {
    if (userId) fetchReaction();
  }, [wyraId, userId]);

  // ✅ Sync dislike events across clients
  useEffect(() => {
    const handleExternalDislike = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.wyraId === wyraId && detail.type === "dislike") {
        setLiked(false);
        fetchReaction();
      }
    };

    reactionBus.addEventListener("reaction-change", handleExternalDislike);
    return () => {
      reactionBus.removeEventListener("reaction-change", handleExternalDislike);
    };
  }, [wyraId]);

  // ✅ Toggle like + insert notification
  const toggleLike = async () => {
    if (!userId) return;
    if (isDisabled) return;

    const newLiked = !liked;
    setLiked(newLiked);

    if (newLiked) {
      setShowAgree(true);
      setTimeout(() => setShowAgree(false), 1000);

      // 1. Upsert reaction
      await supabase.from("wyra_reaction").upsert(
        {
          wyra_id: wyraId,
          user_id: userId,
          type: "like",
        },
        { onConflict: "wyra_id,user_id" }
      );

      // 2. Dispatch reaction event
      reactionBus.dispatchEvent(
        new CustomEvent("reaction-change", {
          detail: { wyraId, type: "like" },
        })
      );

      // 3. Insert notification for wyra owner
      const { data: wyra } = await supabase
        .from("wyra")
        .select("created_by")
        .eq("id", wyraId)
        .single();

      if (wyra?.created_by && wyra.created_by !== userId) {
        const isAllowed = await isNotificationAllowed(
          wyra.created_by,
          "likes_dislikes_my_wyra"
        );
        if (isAllowed) {
          await supabase.from("notifications").insert([
            {
              type: "like",
              sender_id: userId,
              recipient_id: wyra.created_by,
              post_id: wyraId,
              message: "liked your wyra",
            },
          ]);
        }
      }
    } else {
      // Remove like
      await supabase
        .from("wyra_reaction")
        .delete()
        .eq("wyra_id", wyraId)
        .eq("user_id", userId);
    }
    fetchReaction();
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleLike}
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer
        ${
          liked
            ? "bg-green-600 text-white dark:text-black"
            : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        }`}
      >
        <ThumbsUp className="w-4 h-4 mr-1" />
        <span>{likesCount}</span>
        <span className="hidden md:inline ml-1">
          {likesCount > 0 ? (likesCount > 1 ? "Likes" : "Like") : "Like"}
        </span>{" "}
      </button>

      {isFloatAllow && showAgree && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-6 animate-float text-green-600 font-bold">
          Agree
        </span>
      )}
    </div>
  );
};

export default LikeButton;
