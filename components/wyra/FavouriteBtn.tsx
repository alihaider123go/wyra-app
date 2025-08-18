"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface FavouriteButtonProps {
  wyraId: string;
  userId: string | undefined;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ wyraId, userId }) => {
  const [favourited, setFavourited] = useState(false);
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

      if (data) setFavourited(true);
    }

    checkFavorite();
  }, [wyraId, userId, supabase]);

  // ✅ Toggle Favorite / Unfavorite
  const toggleFavourite = async () => {
    if (!userId) {
      alert("Please login to mark as favourite");
      return;
    }

    setLoading(true);

    try {
      if (favourited) {
        // ✅ Unfavorite (Delete)
        await supabase
          .from("wyra_favorites")
          .delete()
          .eq("wyra_id", wyraId)
          .eq("user_id", userId);

        setFavourited(false);

      } else {
        // ✅ Favorite (Insert)
        await supabase.from("wyra_favorites").insert([
          {
            wyra_id: wyraId,
            user_id: userId,
          },
        ]);

        const { data: wyra } = await supabase
          .from("wyra")
          .select("created_by")
          .eq("id", wyraId)
          .single();

        if (wyra?.created_by && wyra.created_by !== userId) {
          await supabase.from("notifications").insert([
            {
              type: "favourite",
              sender_id: userId,
              recipient_id: wyra.created_by,
              post_id: wyraId,
              message: "mark favourite your wyra",
            },
          ]);
        }
        setFavourited(true);
      }
    } catch (error) {
      console.error("Favourite toggle error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavourite}
      disabled={loading}
      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer ${favourited ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
    >
      <Heart
        className={`w-4 h-4 mr-1 transition ${favourited ? "fill-current text-white" : ""
          }`}
      />
      <span className="md:block hidden">
        {favourited ? "Favourited" : "Favourite"}
      </span>
    </button>
  );
};

export default FavouriteButton;
