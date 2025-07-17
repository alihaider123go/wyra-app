"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";

interface FavouriteButtonProps {
  wyraId: string;
  userId: string | undefined;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({ wyraId, userId }) => {
  const [liked, setLiked] = useState(false);
  const supabase = createClient();

  return (
    <button
      // onClick={toggleLike}
      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer
        bg-gray-200 text-gray-800`}
    >
      <Heart className="w-4 h-4 mr-1" />
      <span className="md:block hidden">Favourite</span>
    </button>
  );
};

export default FavouriteButton;
