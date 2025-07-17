"use client";

import React, { useState, useEffect } from "react";
import { ThumbsDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";

interface DislikeButtonProps {
  wyraId: string;
  userId: string | undefined;
}

const DislikeButton: React.FC<DislikeButtonProps> = ({ wyraId, userId }) => {
  const [disliked, setDisliked] = useState(false);
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
    } else {
      await supabase
        .from("wyra_reaction")
        .delete()
        .eq("wyra_id", wyraId)
        .eq("user_id", userId);
    }
  };

  return (
    <button
      onClick={toggleDislike}
      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer 
        ${disliked ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"}`}
    >
      <ThumbsDown className="w-4 h-4 mr-1" />
       <span className="md:block hidden">Dislike</span>
    </button>
  );
};

export default DislikeButton;
