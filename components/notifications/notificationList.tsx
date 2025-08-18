"use client";

import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "./useNotifications";

export default function NotificationsList({ userId }: any) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-4 rounded-lg border shadow-sm cursor-pointer transition ${
                n.is_read ? "bg-gray-100" : "bg-white"
              }`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="flex items-center space-x-3">
                {n.sender?.avatar ? (
                  <img
                    src={n.sender.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                    {n.sender?.firstname?.[0] ?? "?"}
                  </div>
                )}

                <div>
                  <p className="text-sm">
                    <span className="font-medium">
                      {n.sender
                        ? `${n.sender.firstname} ${n.sender.lastname}`
                        : "Someone"}
                    </span>{" "}
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
