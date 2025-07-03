import { useState } from "react";
import { Message } from "@/actions/types";
import { SupabaseClient } from "@supabase/supabase-js";

export default function MessageInput({
  supabase,
  chatId,
  currentUserId,
  onNewMessage,
}: {
  supabase: SupabaseClient;
  chatId: string | undefined;
  currentUserId: string | undefined;
  onNewMessage: (msg: Message) => void;
}) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!chatId || !text.trim()) return;

    const { data, error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      content: text.trim(),
    }).select().single();

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setText("");
    onNewMessage(data);
  };

  return (
    <div className="p-4 border-t flex">
      <input
        type="text"
        value={text}
        placeholder="Type a message..."
        onChange={(e) => setText(e.target.value)}
        className="flex-grow border rounded px-3 py-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button onClick={sendMessage} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded">
        Send
      </button>
    </div>
  );
}
