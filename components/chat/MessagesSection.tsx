import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Chat, Message } from "@/actions/types";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { IoMdArrowRoundBack } from "react-icons/io";

interface MessagesSectionProps {
  chat: Chat | null;
  currentUserId: string | undefined;
  onSendMessage: (msg: Message) => void;
  onBack:any
}

export default function MessagesSection({
  chat,
  currentUserId,
  onSendMessage,
  onBack,
}: MessagesSectionProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagePage, setMessagePage] = useState(1);
  const messagesPerPage = 20;

  const fetchMessages = async () => {
    if (!chat) {
      setMessages([]);
      return;
    }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: false })
        .limit(messagesPerPage * messagePage);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      if (data) {
        setMessages(data.reverse()); // oldest message on top
      }
    };

  useEffect(() => {
    fetchMessages();
  }, [chat, messagePage, supabase]);

  useEffect(() => {
    if (!chat) return;

    const channel = supabase
      .channel(`chat_messages_${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Prevent duplicates if message already exists
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          onSendMessage(newMessage);
          fetchMessages()
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat, supabase, onSendMessage]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      setMessagePage((p) => p + 1);
    }
  };

  if (!chat) {
    return (
      <div className="w-3/4 flex flex-col items-center justify-center border-l">
        <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
        <p className="text-gray-500">Choose a conversation to start messaging</p>
      </div>
    );
  }

  return (
<div className=" flex flex-col md:h-[88vh] h-[80vh]">
  {/* Chat Header */}
   <div className="md:hidden flex items-center p-3 border-b bg-white">
        <button onClick={onBack} className="text-blue-600 text-2xl font-semibold">
          <IoMdArrowRoundBack />
        </button>
        <h2 className="ml-3 font-bold text-center w-full">{chat?.name || "Chat"}</h2>
      </div>

  {/* Scrollable Messages */}
  <div className="flex-1 overflow-y-auto p-4">
    {messages.map((msg) => (
      <MessageItem
        key={msg.id}
        message={msg}
        currentUserId={currentUserId}
      />
    ))}
  </div>

  {/* Fixed Input at Bottom */}
  <div className="flex-shrink-0">
    <MessageInput
      supabase={supabase}
      chatId={chat.id}
      currentUserId={currentUserId}
      onNewMessage={(msg) => {
        onSendMessage(msg);
      }}
    />
  </div>
</div>


  );
}
