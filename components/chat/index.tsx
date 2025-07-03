import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ChatList from "./ChatList";
import MessagesSection from "./MessagesSection";
import { Chat, Message } from "@/actions/types";

interface ChatProps {
  userId: string | undefined;
}

export default function ChatPage({ userId }: ChatProps) {
  const supabase = createClient();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const fetchChats = async () => {
    if (!userId) return;

    const { data, error } = await supabase.rpc("get_user_chats", {
      user_uuid: userId,
    });

    if (error) {
      console.error("get_user_chats RPC error", error);
      return;
    }

    const chats: Chat[] = (data || []).map(
      (item: {
        chat_id: string;
        is_group: boolean;
        chat_name: string | null;
        avatar: string | null;
        username: string | null;
        last_message: string | null;
        last_message_at: string | null;
      }) => ({
        id: item.chat_id,
        is_group: item.is_group,
        name: item.chat_name,
        avatar: item.avatar,
        username: item.username,
        lastMessage: item.last_message,
        lastMessageAt: item.last_message_at,
      })
    );

    chats.sort(
      (a, b) =>
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
    );

    setChats(chats);
  };

  useEffect(() => {
    fetchChats();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const messageSubscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // Only listen for messages in chats user is part of (simplified to selected chat here)
          filter: `chat_id=eq.${selectedChat?.id ?? ""}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setChats((prevChats) => {
            const updatedChats = prevChats.map((chat) => {
              if (chat.id === newMessage.chat_id) {
                return {
                  ...chat,
                  lastMessage: newMessage.content,
                  lastMessageAt: newMessage.created_at,
                };
              }
              return chat;
            });

            updatedChats.sort(
              (a, b) =>
                new Date(b.lastMessageAt || 0).getTime() -
                new Date(a.lastMessageAt || 0).getTime()
            );

            return updatedChats;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [userId, selectedChat?.id]);

  return (
    <div className="flex h-screen">
      <ChatList
        userId={userId}
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewChat={(chat) => {
          setChats((prev) => [chat, ...prev]);
          setSelectedChat(chat);
        }}
      />
      <MessagesSection
        chat={selectedChat}
        currentUserId={userId}
        onSendMessage={(msg) => {
          // Optional: handle side effects on new message here if needed
        }}
      />
    </div>
  );
}
