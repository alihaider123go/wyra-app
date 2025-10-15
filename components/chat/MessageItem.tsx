import { useEffect, useState } from "react";
import { Message } from "@/actions/types";
import { formatDateTime } from "@/utils/helper";
import UserOnlineStatus from "../ui/userOnlineStatus";

export default function MessageItem({
  message,
  currentUserId,
  avatar,
  currenctUserAvatar
}: {
  message: Message;
  currentUserId: string | undefined;
  avatar:any
  currenctUserAvatar:any

}) {

  const isMine = message.sender_id === currentUserId;
  
  return (
    <div className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}>
      {
        !isMine
        ?
        <div className="relative w-12 h-12 rounded-full mr-2">
         <img
          src={avatar}
          alt={""}
          className="mr-2 h-full w-full rounded-full object-cover"
        />
        <UserOnlineStatus userId={message.sender_id}/>
        </div>
        : null
      }

      <div
        className={`inline-block px-3 py-1 rounded ${
          isMine ? "bg-blue-500 text-white" : "bg-gray-300 dark:bg-gray-800 text-black dark:text-white"
        }`}
      >
        <div>{message.content}</div>
        <small className="text-xs text-white">
          {formatDateTime(message.created_at)}
        </small>
      
      </div>
      {
        isMine
        ?
         <img
          src={currenctUserAvatar}
          alt={""}
          className="ml-2 w-12 h-12 rounded-full object-cover"
        />
        : null
      }

      
    </div>
  );
}
