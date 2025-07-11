"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { UserRoundPlus, UserRoundCheck } from "lucide-react";

interface FollowButtonProps {
  currentUserId: string | undefined; // the user currently logged in
  profileUserId: string | undefined; // the user being viewed
}

export default function FollowButton({
  currentUserId,
  profileUserId,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Prevent self-follow
  if (!currentUserId || !profileUserId || currentUserId === profileUserId) return null;

  useEffect(() => {
    const checkFollowStatus = async () => {
      const { data, error } = await supabase
        .from("user_followers")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", profileUserId)
        .maybeSingle();

      if (!error && data) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    };

    checkFollowStatus();
  }, [currentUserId, profileUserId, supabase]);

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
      // Follow (safe insert)
      const { error } = await supabase
        .from("user_followers")
        .upsert(
          [{ follower_id: currentUserId, following_id: profileUserId }],
          { onConflict: "follower_id,following_id"  }
        );

      if (!error) {
        setIsFollowing(true);
      }
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-3 py-1 text-sm text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? "bg-gradient-to-r from-red-500 to-red-800 hover:from-red-600 hover:to-red-900"
          : "bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-600 hover:to-blue-900"
      }`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          Loading...
        </div>
      ) : isFollowing ? (
        <>
          <UserRoundCheck className="w-5 h-5 mr-1" /> Unfollow
        </>
      ) : (
        <>
          <UserRoundPlus className="w-5 h-5 mr-1" /> Follow
        </>
      )}
    </Button>
  );
}
