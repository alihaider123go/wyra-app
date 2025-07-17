"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";

interface LikeButtonProps {
  wyraId: string;
  userId: string | undefined;
}

const LikeButton: React.FC<LikeButtonProps> = ({ wyraId, userId }) => {
  const [liked, setLiked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchReaction = async () => {
      const { data } = await supabase
        .from("wyra_reaction")
        .select("type")
        .eq("wyra_id", wyraId)
        .eq("user_id", userId)
        .eq("type", "like")
        .maybeSingle();
      setLiked(data?.type === "like");
    };

    if (userId) fetchReaction();
  }, [wyraId, userId]);

  useEffect(() => {
    const handleExternalDislike = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.wyraId === wyraId && detail.type === "dislike") {
        setLiked(false); // someone clicked dislike, clear like
      }
    };

    reactionBus.addEventListener("reaction-change", handleExternalDislike);
    return () => {
      reactionBus.removeEventListener("reaction-change", handleExternalDislike);
    };
  }, [wyraId]);

  const toggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);

    if (newLiked) {
      await supabase.from("wyra_reaction").upsert(
        {
          wyra_id: wyraId,
          user_id: userId,
          type: "like",
        },
        { onConflict: "wyra_id,user_id" }
      );

      // Notify sibling (DislikeButton)
      reactionBus.dispatchEvent(
        new CustomEvent("reaction-change", {
          detail: { wyraId, type: "like" },
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
      onClick={toggleLike}
      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer
        ${liked ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}
    >
      <ThumbsUp className="w-4 h-4 mr-1" />
      <span className="md:block hidden">Like</span>
    </button>
  );
};

export default LikeButton;
