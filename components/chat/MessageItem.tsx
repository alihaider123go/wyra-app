import { useEffect, useState } from "react";
import { Message } from "@/actions/types";
import { formatDateTime } from "@/utils/helper";
import UserOnlineStatus from "../ui/userOnlineStatus";

export default function MessageItem({
  message,
  currentUserId,
  avatar,
  currenctUserAvatar,
  userName,
}: {
  message: Message;
  currentUserId: string | undefined;
  avatar: any;
  currenctUserAvatar: any;
  userName?: string;
}) {
  const isMine = message.sender_id === currentUserId;

  return (
    <div className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}>
      {!isMine ? (
        avatar ? (
          <div className="relative w-12 h-12 rounded-full mr-2">
            <img
              src={avatar}
              alt={"avatar"}
              className="mr-2 h-full w-full rounded-full object-cover"
            />
            <UserOnlineStatus userId={message.sender_id} />
          </div>
        ) : (
          <div
            className="relative mr-2 w-12 h-12 rounded-full p-[2px]
                 bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center
                   bg-white dark:bg-black text-gray-700 dark:text-gray-300 font-bold text-lg"
            ></div>
          </div>
        )
      ) : null}

      <div
        className={`inline-block px-3 py-1 rounded ${
          isMine
            ? "bg-blue-500 text-white"
            : "bg-gray-300 dark:bg-gray-800 text-black dark:text-white"
        }`}
      >
        <div>{message.content}</div>
        <small className="text-xs text-white">
          {formatDateTime(message.created_at)}
        </small>
      </div>
      {isMine ? (
        currenctUserAvatar ? (
          <div
            className="ml-2 w-12 h-12 rounded-full
                   bg-gradient-to-r from-blue-500 to-purple-600
                   flex items-center justify-center p-1"
          >
            <img
              src={currenctUserAvatar}
              alt="User Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        ) : (
          <div
            className="relative ml-2 w-12 h-12 rounded-full p-[2px]
                 bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center
                   bg-white dark:bg-black text-gray-700 dark:text-gray-300 font-bold text-lg"
            >
              {userName}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
