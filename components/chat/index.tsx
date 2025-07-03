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
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagePage, setMessagePage] = useState(1);
  const messagesPerPage = 20;

  useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      const { data, error } = await supabase.rpc("get_user_chats", {
        user_uuid: userId,
      });

      if (error) {
        console.error("get_user_chats RPC error", error);
      }

      const chats: Chat[] = (data || []).map(
        (item: {
          chat_id: any;
          is_group: any;
          chat_name: any;
          avatar: any;
          username: any;
          last_message: any;
          last_message_at: any;
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

    fetchChats();
  }, [userId]);

  //   // Fetch messages for selected chat with pagination
  //   useEffect(() => {
  //     if (!selectedChat) return;

  //     supabase
  //       .from("messages")
  //       .select("*")
  //       .eq("chat_id", selectedChat.id)
  //       .order("created_at", { ascending: false })
  //       .limit(messagesPerPage * messagePage)
  //       .then(({ data, error }) => {
  //         if (error) {
  //           console.error("Error fetching messages:", error);
  //           return;
  //         }
  //         if (data) {
  //           setMessages(data.reverse()); // oldest at top
  //         }
  //       });
  //   }, [selectedChat, messagePage]);

  return (
    <div className="flex h-screen">
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        userId={userId}
        onNewChat={(chat) => {
          setChats((prev) => [chat, ...prev]);
          setSelectedChat(chat);
        }}
      />
      {/* <MessagesSection
        chat={selectedChat}
        messages={messages}
        currentUserId={userId}
        onLoadMore={() => setMessagePage((p) => p + 1)}
        onSendMessage={(msg) => setMessages((m) => [...m, msg])}
      /> */}
    </div>
  );
}
