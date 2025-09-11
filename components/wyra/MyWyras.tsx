"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, ThumbsUp, ThumbsDown, MessageCircle, X } from "lucide-react";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  User as UserIcon,
  CircleOff,
} from "lucide-react";
import Link from "next/link";
import { formatDate, isNotificationAllowed, relativeTime } from "@/utils/helper";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserOnlineStatus from "../ui/userOnlineStatus";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import EditWyra from "./EditWyra";
import FollowButton from "./FollowUnfollowButton";
import { deleteWyra } from "@/actions/wyra";
import { User } from "@supabase/supabase-js";
import WyraSection from "./Wyra";

interface WyraMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
}

interface WyraOption {
  id: string;
  option_text: string;
  is_edit: boolean;
  position: number;
  wyra_media: WyraMedia[];
}

interface Wyra {
  id: string;
  title?: string;
  created_at: string;
  created_by: string;
  is_edit: boolean;
  wyra_option: WyraOption[];
}

interface MyWyrasProps {
  userId: string | undefined;
  setActiveTab?:any
  setSelectedUserId?:any
  loggedInUserId?:any
}

export default function MyWyras({ userId ,setActiveTab,setSelectedUserId,loggedInUserId}: MyWyrasProps) {
  const [wyraList, setWyraList] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const fetchWyras = async () => {
    setLoading(true);
    const supabase = createClient();

    // 1. Fetch wyras created by the user
    const { data: wyras, error: wyraError } = await supabase
      .from("wyra")
      .select(`
      id,
      title,
      created_at,
      created_by,
      is_edit,
      user_profiles (
        id,
        firstname,
        lastname,
        username,
        avatar,
        account_settings (
          show_real_name,
          multi_color_why_boxes
        ),
          user_blocks!blocked_id (
    blocker_id,
    blocked_id
  )
      ),
      wyra_circles (
        circle:circles (
          id,
          name
        )
      ),
      wyra_option (
        id,
        option_text,
        is_edit,
        position,
        wyra_media (
          id,
          media_url,
          media_type
        )
      ),
      wyra_selected_option:wyra_selected_option!left (
        id,
        selected_option_id,
        why,
        user_id,
        wyra_option (
          id,
          option_text,
          position
        ),
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          avatar
        )
      )
    `)
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (wyraError) {
      console.error("Error fetching wyras:", wyraError.message);
      setWyraList([]);
      setLoading(false);
      return;
    }

    const wyraIds = wyras?.map((w) => w.id) ?? [];

    // 2. Fetch reactions (likes & dislikes)
    const { data: reactions, error: reactionError } = await supabase
      .from("wyra_reaction")
      .select("wyra_id, type")
      .in("wyra_id", wyraIds);

    const reactionCounts: Record<string, { like: number; dislike: number }> = {};
    if (reactions) {
      for (const { wyra_id, type } of reactions) {
        if (!reactionCounts[wyra_id]) {
          reactionCounts[wyra_id] = { like: 0, dislike: 0 };
        }
        if (type === "like") {
          reactionCounts[wyra_id].like++;
        } else if (type === "dislike") {
          reactionCounts[wyra_id].dislike++;
        }
      }
    }

    // 3. Fetch comments count
    const { data: comments } = await supabase
      .from("wyra_comment")
      .select("wyra_id")
      .in("wyra_id", wyraIds);

    const commentCounts: Record<string, number> = {};
    if (comments) {
      for (const { wyra_id } of comments) {
        commentCounts[wyra_id] = (commentCounts[wyra_id] || 0) + 1;
      }
    }

    // 4. Transform wyras (convert user_profiles → creator)
    const formattedWyras = (wyras ?? []).map((wyra) => {
      const profile: any = Array.isArray(wyra.user_profiles)
        ? wyra.user_profiles[0]
        : wyra.user_profiles;

      return {
        ...wyra,
        creator: {
          id: profile?.id,
          firstname:
            profile?.account_settings?.show_real_name || wyra.created_by === userId
              ? profile?.firstname
              : "Anonymous",
          lastname:
            profile?.account_settings?.show_real_name || wyra.created_by === userId
              ? profile?.lastname
              : "",
          username: profile?.username,
          avatar: profile?.avatar,
        },
         is_blocked: profile?.user_blocks?.some(
          (block:any) =>
            block.blocker_id === loggedInUserId &&
            block.blocked_id === profile.id
        ) || false,
        settings: profile?.account_settings,
        likeCount: reactionCounts[wyra.id]?.like || 0,
        dislikeCount: reactionCounts[wyra.id]?.dislike || 0,
        commentCount: commentCounts[wyra.id] || 0,
      };
    });

    setWyraList(formattedWyras);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchWyras();
  }, []);


  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (wyraList.length === 0)
    return <div className="text-center py-10">No Wyras yet.</div>;

  return (
    <WyraSection
      wyras={wyraList}
      fetchWyras={fetchWyras}
      setActiveTab={setActiveTab}
      setSelectedUserId={setSelectedUserId}
    />
  );
}

