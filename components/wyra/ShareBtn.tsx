"use client";

import React, { useState, useEffect } from "react";
import { Forward } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import reactionBus from "@/utils/reactionBus";

interface ShareButtonProps {
  wyraId: string;
  userId: string | undefined;
}

const ShareButton: React.FC<ShareButtonProps> = ({ wyraId, userId }) => {
  return (
    <button
      // onClick={toggleLike}
      className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer
        bg-gray-200 text-gray-800`}
    >
      <Forward className="w-4 h-4 mr-1" />
      <span className="md:block hidden">Share</span>
    </button>
  );
};

export default ShareButton;
