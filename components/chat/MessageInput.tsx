import { useEffect, useState } from "react";
import { Message } from "@/actions/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { isSettingAllowed } from "@/utils/helper";

export default function MessageInput({
  supabase,
  chatId,
  senderId,
  currentUserId,
  onNewMessage,
}: {
  supabase: SupabaseClient;
  chatId: string | undefined;
  senderId?: string;
  currentUserId: string | undefined;
  onNewMessage: (msg: Message) => void;
}) {
  const [text, setText] = useState("");
  const [isUserAllowToSendMessage, setIsUserAllowToSendMessage] = useState(false)

  async function isUserFollowing(followerId:any, followingId:any) {
  const { data, error } = await supabase
    .from('user_followers')
    .select('id') // or use 'count' if you just need a yes/no
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle(); // or `.single()` if you expect exactly one

  if (error) {
    console.error(error)
    return false
  }

  return !!data // returns true if a record exists, false otherwise
}

  const checkUserSettings = async () => {
    const isAllowedEveryone = await isSettingAllowed(senderId, "allow_dm_everyone")
    const isAllowedFollower = await isSettingAllowed(senderId, "allow_dm_followers")
    const isNotAllowed = await isSettingAllowed(senderId, "no_dm")
    const isFollowing = await isUserFollowing(currentUserId, senderId)

    if (isNotAllowed) {
      setIsUserAllowToSendMessage(false)
    }
    if (isAllowedEveryone) {
      setIsUserAllowToSendMessage(true)
    }
    if (isAllowedFollower && isFollowing) {
      setIsUserAllowToSendMessage(true)
    }
  }

  useEffect(() => {
    checkUserSettings()
  }, [])

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
    <div>
      {!isUserAllowToSendMessage
        ?
        <h3 className="text-black text-sm p-2">
          You are not allowed to send a message to this user.
        </h3>
        : null}

      <div className="p-4 border-t flex">

        <input
          type="text"
          value={text}
          disabled={!isUserAllowToSendMessage}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
          className="flex-grow border rounded px-3 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button disabled={!isUserAllowToSendMessage} onClick={sendMessage} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
