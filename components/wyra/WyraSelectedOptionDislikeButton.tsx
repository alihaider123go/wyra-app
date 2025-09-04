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

  // ✅ Fetch initial dislike status
  useEffect(() => {
    if (!userId) return;

    const fetchReaction = async () => {
      const { data } = await supabase
        .from("wyra_selected_option_reaction")
        .select("type")
        .eq("wyra_selected_option_id", wyraSelectedOptionId)
        .eq("user_id", userId)
        .eq("type", "dislike")
        .maybeSingle();

      setDisliked(data?.type === "dislike");
    };

    fetchReaction();
  }, [wyraSelectedOptionId, userId]);

  // ✅ Sync external like reactions
  useEffect(() => {
    const handleExternalLike = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.wyraSelectedOptionId === wyraSelectedOptionId && detail.type === "like") {
        setDisliked(false); // clear dislike if like is set
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
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDislike}
        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer 
        ${disliked ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        <ThumbsDown className="w-4 h-4 mr-1" />
        <span>{count}</span>
        <span className="hidden md:inline ml-1">
          {count > 0 ? (count > 1 ? "Dislikes" : "Dislike") : "Dislike"}
        </span>
      </button>
    </div>
  );
};

export default WyraSelectedOptionDislikeButton;
