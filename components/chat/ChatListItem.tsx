import { Chat } from "@/actions/types";
import { formatDateTime } from "@/utils/helper";

export default function ChatListItem({
  currentUserId,
  chat,
  isSelected,
  onClick,
}: {
  currentUserId?:string | undefined;
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}) {
  console.log(chat);
  return (
    <div
      onClick={onClick}
      className={`flex items-start space-x-3 p-3 cursor-pointer border-b ${
        isSelected ? "bg-gray-200" : ""
      }`}
    >
      {/* Avatar or initials */}
      {chat.avatar ? (
        <img
          src={chat.avatar}
          alt={chat.name || "Avatar"}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-sm uppercase">
          {chat.name?.[0] || "?"}
        </div>
      )}

      {/* Chat content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h4 className="font-medium truncate">{chat.name}</h4>

          <div className="flex items-center space-x-2">
            {/* Unread badge */}
            {chat.unreadCount && chat.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {chat.unreadCount}
              </span>
            )}
            {/* Time */}
            {chat.lastMessageAt && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDateTime(chat.lastMessageAt)}
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
