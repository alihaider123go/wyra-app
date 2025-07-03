"use client";

import { useEffect, useState } from "react";
import { Chat, UserProfile } from "@/actions/types";
import { createClient } from "@/utils/supabase/client";
export default function UserName({
  chat,
  currentUserId,
}: {
  chat: Chat;
  currentUserId: string | undefined;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!chat || chat.is_group || !currentUserId) return;

    const fetchOtherUser = async () => {
      const supabase = createClient();

      const { data: members, error } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", chat.id)
        .neq("user_id", currentUserId)
        .limit(1)
        .single();

      if (error || !members) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id,firstname, lastname, username, avatar")
        .eq("id", members.user_id)
        .single();

      if (!profileError) {
        setUser(profile);
      }
    };

    fetchOtherUser();
  }, [chat, currentUserId]);

  if (!user) return <span className="text-gray-500">Loading...</span>;

  return (
    <div className="flex items-center space-x-3">
      {/* Avatar or initials */}
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={`${user.firstname} ${user.lastname}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-sm uppercase">
          {user.firstname?.[0]}
          {user.lastname?.[0]}
        </div>
      )}

      {/* Name and username */}
      <div>
        <div className="font-medium">
          {user.firstname} {user.lastname}
        </div>
        <div className="text-sm text-gray-500">@{user.username}</div>
      </div>
    </div>
  );
}
