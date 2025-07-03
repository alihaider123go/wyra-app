import { Message, Chat } from "@/actions/types";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { createClient } from "@/utils/supabase/client";
import UserName from "./UserName";

export default function MessagesSection({
  chat,
  messages,
  currentUserId,
  onLoadMore,
  onSendMessage,
}: {
  chat: Chat | null;
  messages: Message[];
  currentUserId: string | undefined;
  onLoadMore: () => void;
  onSendMessage: (msg: Message) => void;
}) {
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      onLoadMore();
    }
  };
const supabase = createClient();

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b">
        <h3>
          {chat?.is_group ? (
            chat.name
          ) : chat ? (
            <UserName
              chat={chat}
              currentUserId={currentUserId}
            />
          ) : (
            "Select chat"
          )}
        </h3>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4"
        onScroll={onScroll}
        style={{ height: "calc(100vh - 100px)" }}
      >
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            supabase={supabase}
            message={msg}
            currentUserId={currentUserId}
          />
        ))}
      </div>
      <MessageInput
        supabase={supabase}
        chatId={chat?.id}
        currentUserId={currentUserId}
        onNewMessage={onSendMessage}
      />
    </div>
  );
}
