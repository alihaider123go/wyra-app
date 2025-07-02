"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X } from "lucide-react"; // Using lucide-react for close icon

interface Props {
  wyraId: string;
  userId: string | undefined;
  onClose: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_profiles: {
    firstname: string | null;
    lastname: string | null;
    username: string | null;
  };
}

const CommentModal: React.FC<Props> = ({ wyraId, userId, onClose }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [fetchingComments, setFetchingComments] = useState(true);

  const supabase = createClient();

  const fetchComments = async () => {
    setFetchingComments(true);
    const { data, error } = await supabase
      .from("wyra_comment")
      .select(
        `
      id,
      content,
      created_at,
      user_profiles (
        firstname,
        lastname,
        username
      )
    `
      )
      .eq("wyra_id", wyraId)
      .order("created_at", { ascending: false });

    if (!error) {
      setComments(data);
    } else {
      console.error("Failed to fetch comments", error);
    }

    setFetchingComments(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("wyra_comment").insert({
      wyra_id: wyraId,
      user_id: userId,
      content: content.trim(),
    });

    setLoading(false);

    if (!error) {
      setContent("");
      await fetchComments();
    } else {
      alert("Failed to submit comment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg relative">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Close comment modal"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Comments</h2>

        <>
          <textarea
            className="w-full h-24 border border-gray-300 rounded-md p-2 mb-1 resize-none"
            placeholder="Write your comment..."
            value={content}
            maxLength={150} // limit input to 150 chars
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="text-right text-xs text-gray-500 mb-4">
            {content.length} / 150
          </div>
        </>

        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Commenting..." : "Comment"}
          </button>
        </div>

        {/* Comment list */}
        {fetchingComments ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border-b pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  <span className="text-sm font-medium">
                    {comment.user_profiles?.firstname &&
                    comment.user_profiles?.lastname
                      ? `${comment.user_profiles.firstname} ${comment.user_profiles.lastname}`
                      : comment.user_profiles?.username || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
