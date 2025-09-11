"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";

interface SelectedOptionLikeButtonProps {
  wyraSelectedOptionId: string;
  userId: string | undefined;
  isFloatAllow?: boolean;
  count?: number;
}

const WyraSelectedOptionLikeButton: React.FC<SelectedOptionLikeButtonProps> = ({
  wyraSelectedOptionId,
  userId,
  count = 0,
}) => {
  const [liked, setLiked] = useState(false);
  const supabase = createClient();
  const [likesCount, setLikesCount] = useState(0);

  const fetchReaction = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("wyra_selected_option_reaction")
      .select("type")
      .eq("wyra_selected_option_id", wyraSelectedOptionId)
      .eq("user_id", userId)
      .eq("type", "like")
      .maybeSingle();

    setLiked(data?.type === "like");

    const { count } = await supabase
      .from("wyra_selected_option_reaction")
      .select("*", { count: "exact", head: true })
      .eq("wyra_selected_option_id", wyraSelectedOptionId)
      .eq("type", "like");

    setLikesCount(count || 0);
  };

  // ✅ Fetch initial like status
  useEffect(() => {


    fetchReaction();
  }, [wyraSelectedOptionId, userId]);

  // ✅ Sync external reactions
  useEffect(() => {
    const handleExternalReaction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.wyraSelectedOptionId === wyraSelectedOptionId && detail.type === "dislike") {
        setLiked(false);
        fetchReaction()
      }
    };

    reactionBus.addEventListener("reaction-change", handleExternalReaction);
    return () => {
      reactionBus.removeEventListener("reaction-change", handleExternalReaction);
    };
  }, [wyraSelectedOptionId]);

  // ✅ Toggle like
  const toggleLike = async () => {
    if (!userId) return;

    const newLiked = !liked;
    setLiked(newLiked);

    if (newLiked) {
      // Upsert reaction
      const { data: existingReaction } = await supabase
        .from("wyra_selected_option_reaction")
        .select("id")
        .eq("wyra_selected_option_id", wyraSelectedOptionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingReaction) {
        await supabase
          .from("wyra_selected_option_reaction")
          .update({ type: "like" })
          .eq("id", existingReaction.id);
      } else {
        await supabase.from("wyra_selected_option_reaction").insert({
          wyra_selected_option_id: wyraSelectedOptionId,
          user_id: userId,
          type: "like",
        });
      }

      // Broadcast reaction
      reactionBus.dispatchEvent(
        new CustomEvent("reaction-change", {
          detail: { wyraSelectedOptionId, type: "like" },
        })
      );
    } else {
      // Remove like
      await supabase
        .from("wyra_selected_option_reaction")
        .delete()
        .eq("wyra_selected_option_id", wyraSelectedOptionId)
        .eq("user_id", userId);
    }
    fetchReaction()
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleLike}
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer
        ${liked ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        <ThumbsUp className="w-4 h-4 mr-1" />
        <span>{likesCount}</span>
        <span className="hidden md:inline ml-1">
          {likesCount > 0 ? (likesCount > 1 ? "Likes" : "Like") : "Like"}
        </span>
      </button>


    </div>
  );
};

export default WyraSelectedOptionLikeButton;
