"use client";

import React, { useState, useEffect } from "react";
import { ThumbsDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";

interface SelectedOptionDislikeButtonProps {
  wyraSelectedOptionId: string;
  userId: string | undefined;
  isFloatAllow?: boolean;
  count?: number;
}

const WyraSelectedOptionDislikeButton: React.FC<SelectedOptionDislikeButtonProps> = ({
  wyraSelectedOptionId,
  userId,
  count = 0,
}) => {
  const [disliked, setDisliked] = useState(false);
  const supabase = createClient();
  const [dislikesCount, setDislikesCount] = useState(0);

  const fetchReaction = async () => {
    const { data } = await supabase
      .from("wyra_selected_option_reaction")
      .select("type")
      .eq("wyra_selected_option_id", wyraSelectedOptionId)
      .eq("user_id", userId)
      .eq("type", "dislike")
      .maybeSingle();

    setDisliked(data?.type === "dislike");

    const { count } = await supabase
      .from("wyra_selected_option_reaction")
      .select("*", { count: "exact", head: true })
      .eq("wyra_selected_option_id", wyraSelectedOptionId)
      .eq("type", "dislike");

    setDislikesCount(count || 0);

  };


  // ✅ Fetch initial dislike status
  useEffect(() => {
    if (!userId) return;



    fetchReaction();
  }, [wyraSelectedOptionId, userId]);

  // ✅ Sync external like reactions
  useEffect(() => {
    const handleExternalLike = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.wyraSelectedOptionId === wyraSelectedOptionId && detail.type === "like") {
        setDisliked(false); // clear dislike if like is set
        fetchReaction()
      }
    };

    reactionBus.addEventListener("reaction-change", handleExternalLike);
    return () => {
      reactionBus.removeEventListener("reaction-change", handleExternalLike);
    };
  }, [wyraSelectedOptionId]);

  // ✅ Toggle dislike
  const toggleDislike = async () => {
    if (!userId) return;

    const newDisliked = !disliked;
    setDisliked(newDisliked);

    if (newDisliked) {

      // Upsert dislike reaction
      const { data: existingReaction } = await supabase
        .from("wyra_selected_option_reaction")
        .select("id")
        .eq("wyra_selected_option_id", wyraSelectedOptionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingReaction) {
        await supabase
          .from("wyra_selected_option_reaction")
          .update({ type: "dislike" })
          .eq("id", existingReaction.id);
      } else {
        await supabase.from("wyra_selected_option_reaction").insert({
          wyra_selected_option_id: wyraSelectedOptionId,
          user_id: userId,
          type: "dislike",
        });
      }

      // Broadcast reaction
      reactionBus.dispatchEvent(
        new CustomEvent("reaction-change", {
          detail: { wyraSelectedOptionId, type: "dislike" },
        })
      );
    } else {
      // Remove dislike
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
        onClick={toggleDislike}
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer 
        ${disliked ? "bg-red-600 text-white dark:text-black" : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}
      >
        <ThumbsDown className="w-4 h-4 mr-1" />
        <span>{dislikesCount}</span>
        <span className="hidden md:inline ml-1">
          {dislikesCount > 0 ? (dislikesCount > 1 ? "Dislikes" : "Dislike") : "Dislike"}
        </span>
      </button>
    </div>
  );
};

export default WyraSelectedOptionDislikeButton;
