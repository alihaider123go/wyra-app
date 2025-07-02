"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface FollowButtonProps {
  currentUserId: string|undefined; // the user currently logged in
  profileUserId: string|undefined; // the user being viewed
}

export default function FollowButton({
  currentUserId,
  profileUserId,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Prevent self-follow
  if (currentUserId === profileUserId) return null;

  useEffect(() => {
    if (currentUserId && profileUserId) {
      checkFollowStatus();
    }
  }, [currentUserId, profileUserId]);

  const checkFollowStatus = async () => {
    const { data, error } = await supabase
      .from("user_followers")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", profileUserId)
      .maybeSingle();

    if (data && !error) {
      setIsFollowing(true);
    }
  };

  const toggleFollow = async () => {
    setLoading(true);

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase
        .from("user_followers")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", profileUserId);

      if (!error) {
        setIsFollowing(false);
      }
    } else {
      // Follow
      const { error } = await supabase.from("user_followers").insert({
        follower_id: currentUserId,
        following_id: profileUserId,
      });

      if (!error) {
        setIsFollowing(true);
      }
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium shadow transition duration-150 ${
        isFollowing
          ? "bg-gray-300 text-black hover:bg-gray-400"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {loading ? "......" : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
