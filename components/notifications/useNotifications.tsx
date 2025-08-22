"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Notification = {
    id: string;
    type: string;
    message: string;
    is_read: boolean;
    post_id:string;
    created_at: string;
    sender: {
        id: string;
        firstname: string;
        lastname: string;
        avatar: string | null;
    } | null;
};

type NotificationsContextType = {
    notifications: Notification[];
    unreadCount: number;
    unreadMessagesCount: number;
    markChatMessagesAsRead: (id: string) => void;
    markAllAsRead: () => void;
    markAsRead: (id: string) => void;
    fetchNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({
    userId,
    children,
}: {
    userId?: string;
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const recalcUnread = (list: Notification[]) => {
        setUnreadCount(list.filter((n) => !n.is_read).length);
    };

    const fetchNotifications = async () => {
        if (!userId) return;
        const { data } = await supabase
            .from("notifications")
            .select(
                `
        id,
        type,
        message,
        is_read,
        post_id,
        created_at,
        sender:sender_id (
          id,
          firstname,
          lastname,
          avatar
        )
      `
            )
            .eq("recipient_id", userId)
            .order("created_at", { ascending: false });

        if (data) {
            setNotifications(data as any[]);
            recalcUnread(data as any[]);
        }
    };

    useEffect(() => {
        if (!userId) return;
        fetchNotifications();
        fetchUnreadMessages();


        const channel = supabase
            .channel(`notifications:user:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `recipient_id=eq.${userId}`,
                },
                async (payload: any) => {
                    const { data } = await supabase
                        .from("notifications")
                        .select(
                            `
              id,
              type,
              message,
              is_read,
              post_id,
              created_at,
              sender:sender_id (
                id,
                firstname,
                lastname,
                avatar
              )
            `
                        )
                        .eq("id", payload.new.id)
                        .single();

                    if (!data) return;

                    setNotifications((prev) => {
                        let updated: Notification[];
                        if (payload.eventType === "INSERT") {
                            updated = [data as any, ...prev];
                        } else if (payload.eventType === "UPDATE") {
                            updated = prev.map((n) => (n.id === data.id ? (data as any) : n));
                        } else {
                            updated = prev;
                        }
                        recalcUnread(updated);
                        return updated;
                    });
                }
            )
            .subscribe();

        let userChatIds: string[] = [];

  // Fetch user chat memberships first
  const fetchChatIds = async () => {
    const { data: memberChats } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("user_id", userId);

    userChatIds = memberChats?.map((c) => c.chat_id) || [];
  };

  fetchChatIds();

  const msgChannel = supabase
    .channel(`messages:user:${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      (payload: any) => {
        const newMsg = payload.new;

        // Only handle messages from chats user belongs to
        if (!userChatIds.includes(newMsg.chat_id)) return;

        if (
          payload.eventType === "INSERT" &&
          newMsg.sender_id !== userId && // exclude self-sent
          !newMsg.is_read // only unread
        ) {
          setUnreadMessagesCount((prev) => prev + 1);
        } else if (
          payload.eventType === "UPDATE" &&
          payload.old.is_read === false &&
          payload.new.is_read === true &&
          newMsg.sender_id !== userId
        ) {
          setUnreadMessagesCount((prev) => Math.max(0, prev - 1));
        }
      }
    )
    .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(msgChannel);

        };
    }, [userId]);

    const markAllAsRead = async () => {
        if (!userId) return;
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("recipient_id", userId)
            .eq("is_read", false);

        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, is_read: true }));
            recalcUnread(updated);
            return updated;
        });
    };

    const markAsRead = async (id: string) => {
        const { data } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id)
            .select(
                `
        id,
        type,
        message,
        is_read,
        post_id,
        created_at,
        sender:sender_id (
          id,
          firstname,
          lastname,
          avatar
        )
      `
            )
            .single();

        if (data) {
            setNotifications((prev) => {
                const updated = prev.map((n) => (n.id === id ? (data as any) : n));
                recalcUnread(updated);
                return updated;
            });
        }
    };

    const fetchUnreadMessages = async () => {
        if (!userId) return;

        // 1. Get all chats this user belongs to
        const { data: memberChats, error: memberError } = await supabase
            .from("chat_members")
            .select("chat_id")
            .eq("user_id", userId);

        if (memberError) {
            console.error("Error fetching chat memberships:", memberError);
            return;
        }

        const chatIds = memberChats?.map((c) => c.chat_id) || [];
        if (chatIds.length === 0) {
            
            setUnreadMessagesCount(0);
            return;
        }

        // 2. Count unread messages in those chats
        const { count, error } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false)
            .neq("sender_id", userId)
            .in("chat_id", chatIds);

        if (error) {
            console.error("Error fetching unread messages:", error);
            return;
        }

        setUnreadMessagesCount(count || 0);
    };


    const markChatMessagesAsRead = async (chatId: string) => {
        if (!userId) return;

        // Only update messages not sent by the current user
        const { data, error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("chat_id", chatId)
            .eq("is_read", false)
            .neq("sender_id", userId) // exclude self-sent messages
            .select("id");

        if (error) {
            console.error("Failed to mark messages as read:", error);
            return;
        }

        if (data && data.length > 0) {
            setUnreadMessagesCount((prev) => Math.max(0, prev - data.length));
        } else {
            setUnreadMessagesCount(0);
        }
    };


    return (
        <NotificationsContext.Provider
            value={{ notifications, unreadCount, unreadMessagesCount, markAllAsRead, markChatMessagesAsRead, markAsRead, fetchNotifications }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
    return ctx;
}
