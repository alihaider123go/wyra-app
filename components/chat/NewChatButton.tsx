import { useState, useEffect } from "react";
import { Chat } from "@/actions/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
export default function NewChatButton({
  supabase,
  userId,
  onChatCreated,
}: {
  supabase: SupabaseClient;
  userId: string | undefined;
  onChatCreated: (chat: Chat) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, firstname, lastname, username, email")
        .or(
          `firstname.ilike.%${search}%,lastname.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
        )
        .neq("id", userId)
        .limit(5);

      if (error) {
        console.error("User search error:", error);
        return;
      }

      setResults(data || []);
    };

    const delayDebounce = setTimeout(fetchUsers, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, supabase, userId]);

  const createChatWithUser = async (otherUserId: string) => {
    // Call RPC to find existing 1:1 chat if you created one in your DB like this:
    const { data: existingChats, error: rpcError } = await supabase.rpc(
      "find_1on1_chat",
      { user1: userId, user2: otherUserId }
    );

    if (rpcError) {
      console.error("RPC error:", rpcError);
    }

    if (existingChats && existingChats.length > 0) {
      onChatCreated(existingChats[0]);
      setOpen(false);
      return;
    }

    // Create new chat
    const { data: newChat, error } = await supabase
      .from("chats")
      .insert([{ is_group: false }])
      .select()
      .single();

    if (error || !newChat) {
      console.error("Chat creation error:", error);
      return;
    }

    // Add members
    await supabase.from("chat_members").insert([
      { chat_id: newChat.id, user_id: userId },
      { chat_id: newChat.id, user_id: otherUserId },
    ]);

    onChatCreated(newChat);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-500 px-3 py-1 rounded text-white"
      >
        <Plus className="inline mr-1" />
        
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">Start new chat</h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="border p-2 w-full rounded mb-4"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {results.length === 0 && (
                <p className="text-gray-500 px-2 py-1">No users found</p>
              )}

              {results.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => createChatWithUser(user.id)}
                >
                  <div className="font-medium">
                    {user.firstname} {user.lastname}
                  </div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
