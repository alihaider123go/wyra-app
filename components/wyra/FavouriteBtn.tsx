"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface FavouriteButtonProps {
  wyraId: string;
  userId: string | undefined;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ wyraId, userId }) => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // ✅ Check if already favorited on mount
  useEffect(() => {
    if (!userId) return;

    async function checkFavorite() {
      const { data } = await supabase
        .from("wyra_favorites")
        .select("id")
        .eq("wyra_id", wyraId)
        .eq("user_id", userId)
        .maybeSingle();

      if (data) setLiked(true);
    }

    checkFavorite();
  }, [wyraId, userId, supabase]);

  // ✅ Toggle Favorite / Unfavorite
  const toggleLike = async () => {
    if (!userId) {
      alert("Please login to mark as favourite");
      return;
    }

    setLoading(true);

    try {
      if (liked) {
        // ✅ Unfavorite (Delete)
        await supabase
          .from("wyra_favorites")
          .delete()
          .eq("wyra_id", wyraId)
          .eq("user_id", userId);

        setLiked(false);
      } else {
        // ✅ Favorite (Insert)
        await supabase.from("wyra_favorites").insert([
          {
            wyra_id: wyraId,
            user_id: userId,
          },
        ]);

        setLiked(true);
      }
    } catch (error) {
      console.error("Favourite toggle error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer ${
        liked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
      }`}
    >
      <Heart
        className={`w-4 h-4 mr-1 transition ${
          liked ? "fill-current text-white" : ""
        }`}
      />
      <span className="md:block hidden">
        {liked ? "Favourited" : "Favourite"}
      </span>
    </button>
  );
};

export default FavouriteButton;
