"use client";

import React, { useEffect, useState } from "react";
import { getFavoriteWyras, getUnifiedHomeWyras } from "@/actions/wyra";
import { createClient } from "@/utils/supabase/client";
import LikeButton from "./LikeBtn";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FollowButton from "./FollowUnfollowButton";
import { Tooltip } from "@heroui/tooltip";
import CreateWyra from "@/components/wyra/CreateWyra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  X,
  User as UserIcon,
} from "lucide-react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Wyra } from "@/actions/types";
import { relativeTime } from "@/utils/helper";
import ShareButton from "./ShareBtn";
import FavouriteButton from "./FavouriteBtn";
import UserOnlineStatus from "../ui/userOnlineStatus";
import { useRouter } from "next/navigation";
import WyraSection from "./Wyra";

export default function FavoritesWyra({ searchTerm }: any) {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  // Map to track follow status per profileUserId
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>(
    {}
  );
  // const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const supabase = createClient();
  async function fetchWyras() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("User not logged in");
      setLoading(false);
      return;
    } else {
      setUser(user);
    }

    try {
      const result = await getFavoriteWyras(user.id, debouncedSearch);
      setWyraList(result || []);
    } catch (err) {
      // console.error("Failed to fetch wyras", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {

    fetchWyras();
  }, [debouncedSearch]);

  // Fetch follow status for all unique profileUserIds when user or wyraList changes
  useEffect(() => {
    if (!user) return;
    async function fetchFollowStatusForAll() {
      const uniqueProfileUserIds = Array.from(
        new Set(
          wyraList.map((w) => w.created_by).filter((id) => id !== user?.id)
        )
      );

      // Query user_followers table for all following relations
      const { data, error } = await supabase
        .from("user_followers")
        .select("following_id")
        .eq("follower_id", user?.id)
        .in("following_id", uniqueProfileUserIds);

      if (error) {
        console.error("Failed to fetch follow statuses", error);
        return;
      }

      // Create map of profileUserId -> true if following
      const followMap: Record<string, boolean> = {};
      uniqueProfileUserIds.forEach((id) => {
        followMap[id] = false;
      });
      if (data) {
        data.forEach((row) => {
          followMap[row.following_id] = true;
        });
      }

      setFollowStatus(followMap);
    }

    fetchFollowStatusForAll();
  }, [user, wyraList, supabase]);

  // Handler to toggle follow/unfollow for a given profileUserId
  const toggleFollow = async (profileUserId: string) => {
    if (!user) return;
    setLoadingStatus((prev) => ({ ...prev, [profileUserId]: true }));

    try {
      if (followStatus[profileUserId]) {
        // Unfollow
        const { error } = await supabase
          .from("user_followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileUserId);

        if (!error) {
          setFollowStatus((prev) => ({ ...prev, [profileUserId]: false }));
        }
      } else {
        // Follow
        const { error } = await supabase
          .from("user_followers")
          .upsert([{ follower_id: user.id, following_id: profileUserId }], {
            onConflict: "follower_id,following_id",
          });

        if (!error) {
          setFollowStatus((prev) => ({ ...prev, [profileUserId]: true }));
        }
      }
    } catch (err) {
      console.error("Error toggling follow", err);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, [profileUserId]: false }));
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!wyraList.length)
    return <div className="text-center py-10">No Wyras yet.</div>;

  return (
    <>
      <WyraSection
        wyras={wyraList}
        fetchWyras={fetchWyras}
        searchTerm={searchTerm}
      />
    </>
  );
}
