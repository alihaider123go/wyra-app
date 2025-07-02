"use client";

import React, { useState } from "react";
import CommentModal from "./CommentModal";
import { MessageCircle } from "lucide-react";

interface Props {
  wyraId: string;
  userId: string | undefined;
}

const CommentButton: React.FC<Props> = ({ wyraId, userId }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        Comment
      </button>

      {open && (
        <CommentModal wyraId={wyraId} userId={userId} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default CommentButton;