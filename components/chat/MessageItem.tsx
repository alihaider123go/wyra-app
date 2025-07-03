import { useEffect, useState } from "react";
import { Message } from "@/actions/types";
import { formatDateTime } from "@/utils/helper";

export default function MessageItem({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId: string | undefined;
}) {
  const isMine = message.sender_id === currentUserId;

  return (
    <div className={`mb-2 ${isMine ? "text-right" : "text-left"}`}>
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
    </div>
  );
}
