import { Chat } from "@/actions/types";
import { formatDateTime } from "@/utils/helper";
export default function ChatListItem({
  chat,
  isSelected,
  onClick,
}: {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start space-x-3 p-3 cursor-pointer border-b ${
        isSelected ? "bg-gray-200" : ""
      }`}
    >
      {/* Avatar or initial */}
      {chat.avatar ? (
        <img
          src={chat.avatar}
          alt={chat.name || ""}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-sm uppercase">
          {chat.name?.[0] || "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{chat.name}</h4>
          <div className="flex flex-col items-end">
        {chat.lastMessageAt && (
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formatDateTime(chat.lastMessageAt)}
          </span>
        )}
        {chat?.unreadCount !== 0 && (
          <span className="mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-semibold">
            {chat.unreadCount}
          </span>
        )}
          </div>
        </div>
        <div className="text-sm text-gray-600 truncate">
          {chat.lastMessage || "No messages yet"}
        </div>
      </div>
    </div>
  );
}
