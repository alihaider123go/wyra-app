import { useState, useEffect } from "react";
import { Chat } from "@/actions/types";
import ChatListItem from "./ChatListItem";
import NewChatButton from "./NewChatButton";
import { createClient } from "@/utils/supabase/client";

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  userId,
  onNewChat,
}: {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  userId: string | undefined;
  onNewChat: (chat: Chat) => void;
}) {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredChats(
        chats.filter((chat) =>
          chat.name?.toLowerCase().includes(lowerSearch) || false
        )
      );
    }
  }, [searchTerm, chats]);

  return (
    <div className="border flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center space-x-4">
        <h2 className="font-bold text-xl">Chats</h2>
        <NewChatButton
          supabase={supabase}
          userId={userId}
          onChatCreated={onNewChat}
        />
      </div>

      {/* Search input */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Chat list */}
      <div className="overflow-y-auto flex-1">
        {filteredChats.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No chats found</p>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChat?.id}
              onClick={() => onSelectChat(chat)}
            />
          ))
        )}
      </div>
    </div>
  );
}
