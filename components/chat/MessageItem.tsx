import { useEffect, useState } from "react";
import { Message } from "@/actions/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { formatDateTime } from "@/utils/helper";

export default function MessageItem({
  supabase,
  message,
  currentUserId,
}: {
  supabase: SupabaseClient;
  message: Message;
  currentUserId: string | undefined;
}) {
  const isMine = message.sender_id === currentUserId;
  const [senderName, setSenderName] = useState<string>("");

  useEffect(() => {
    supabase
      .from("user_profiles")
      .select("firstname, lastname")
      .eq("id", message.sender_id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setSenderName("User");
        else setSenderName(`${data.firstname} ${data.lastname}`);
      });
  }, [message.sender_id, supabase]);

  return (
    <div className={`mb-2 ${isMine ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block px-3 py-1 rounded ${
          isMine ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <div className="font-bold text-sm">{isMine ? "You" : senderName}</div>
        <div>{message.content}</div>
        <small className="text-xs text-white-600">
          {formatDateTime(message.created_at)}
        </small>
      </div>
    </div>
  );
}
