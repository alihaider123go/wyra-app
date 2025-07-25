import { useEffect, useState } from "react";
import { Message } from "@/actions/types";
import { formatDateTime } from "@/utils/helper";

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
         <img
          src={avatar}
          alt={""}
          className="mr-2 w-10 h-10 rounded-full object-cover"
        />
        : null
      }

      <div
        className={`inline-block px-3 py-1 rounded ${
          isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <div>{message.content}</div>
        <small className="text-xs text-white-600">
          {formatDateTime(message.created_at)}
        </small>
      
      </div>
      {
        isMine
        ?
         <img
          src={currenctUserAvatar}
          alt={""}
          className="ml-2 w-10 h-10 rounded-full object-cover"
        />
        : null
      }

      
    </div>
  );
}
