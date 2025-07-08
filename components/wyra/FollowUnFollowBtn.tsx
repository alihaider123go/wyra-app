"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button"
import {
  
UserRoundPlus,
UserRoundCheck,
  Plus,
} from "lucide-react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

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
  <Button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-2 py-1 text-sm text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
        isFollowing
          ? "bg-gradient-to-r from-red-500 to-red-800 hover:from-red-600 hover:to-red-900"
          : "bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-600 hover:to-blue-900"
      }`}
    >
      {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Following </> : isFollowing ? 
      (
        <>
         <UserRoundCheck className="w-6 h-6" /> Unfollow
        </>
      )
      : (
        <>
         <UserRoundPlus className="w-6 h-6" /> Follow
        </>
      )}
    </Button>
  );
}
