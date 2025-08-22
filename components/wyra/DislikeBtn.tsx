"use client";

import React, { useState, useEffect } from "react";
import { ThumbsDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";
import { isNotificationAllowed } from "@/utils/helper";

interface DislikeButtonProps {
  wyraId: string;
  userId: string | undefined;
  isFloatAllow?:any
}

const DislikeButton: React.FC<DislikeButtonProps> = ({ wyraId, userId,isFloatAllow }) => {
  const [disliked, setDisliked] = useState(false);
  const [showDisagree, setShowDisagree] = useState(false); // ✅ for floating text
  const supabase = createClient();

  useEffect(() => {
    const fetchReaction = async () => {
      const { data } = await supabase
        .from("wyra_reaction")
        .select("type")
        .eq("wyra_id", wyraId)
        .eq("user_id", userId)
        .eq("type", "dislike")
        .maybeSingle();

      setDisliked(data?.type === "dislike");
    };

    if (userId) fetchReaction();
  }, [wyraId, userId]);

  useEffect(() => {
    const handleExternalLike = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.wyraId === wyraId && detail.type === "like") {
        setDisliked(false); // someone clicked like, clear dislike
      }
    };

    reactionBus.addEventListener("reaction-change", handleExternalLike);
    return () => {
      reactionBus.removeEventListener("reaction-change", handleExternalLike);
    };
  }, [wyraId]);

  const toggleDislike = async () => {
    const newDisliked = !disliked;
    setDisliked(newDisliked);

    if (newDisliked) {
      setShowDisagree(true); // ✅ show floating text
      setTimeout(() => setShowDisagree(false), 1000);

      await supabase.from("wyra_reaction").upsert(
        {
          wyra_id: wyraId,
          user_id: userId,
          type: "dislike",
        },
        { onConflict: "wyra_id,user_id" }
      );

      // Notify sibling (LikeButton)
      reactionBus.dispatchEvent(
        new CustomEvent("reaction-change", {
          detail: { wyraId, type: "dislike" },
        })
      );

      // 3. Insert notification for wyra owner
      const { data: wyra } = await supabase
        .from("wyra")
        .select("created_by")
        .eq("id", wyraId)
        .single();

      if (wyra?.created_by && wyra.created_by !== userId) {

        const isAllowed = await isNotificationAllowed(wyra.created_by, "likes_dislikes_my_wyra")
        if (isAllowed) {
          await supabase.from("notifications").insert([
            {
              type: "dislike",
              sender_id: userId,
              recipient_id: wyra.created_by,
              post_id: wyraId,
              message: "disliked your wyra",
            },
          ]);
        }
      }
    } else {
      await supabase
        .from("wyra_reaction")
        .delete()
        .eq("wyra_id", wyraId)
        .eq("user_id", userId);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDislike}
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer 
        ${disliked ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        <ThumbsDown className="w-4 h-4 mr-1" />
        <span className="md:block hidden">Dislike</span>
      </button>

      {/* ✅ Floating "Disagree" Text */}
      {isFloatAllow && showDisagree && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-6 animate-float text-red-600 font-bold">
          Disagree
        </span>
      )}
    </div>
  );
};

export default DislikeButton;
