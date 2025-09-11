"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export default function BlockUserInfo({setActiveTab,setSelectedUserId}:any) {
  const supabase = createClient();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [userID, setUserID] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
const dropdownRef = useRef<HTMLDivElement>(null);

 const fetchBlockedUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserID(user.id);
        const { data, error } = await supabase
          .from("user_blocks")
          .select(`
            blocked_id,
            user_profiles:blocked_id (
              id,
              firstname,
              lastname,
              username,
              avatar
            )
          `)
          .eq("blocker_id", user.id);

        if (error) {
          console.error("Failed to fetch blocked users", error);
        } else {
          setBlockedUsers(data || []);
        }
      }
    };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      const blockedIds = blockedUsers.map((u) => u.blocked_id);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, firstname, lastname, username, email")
        .or(
          `firstname.ilike.%${search}%,lastname.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
        )
        .neq("id", userID)
        .not("id", "in", `(${blockedIds.join(",")})`)
        .limit(5);

      if (error) {
        // console.error("User search error:", error);
        return;
      }

      setResults(data || []);
    };

    const delayDebounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, userID, supabase, blockedUsers]);

  const blockUser = async (id: string) => {
    const { error } = await supabase.from("user_blocks").insert({
      blocker_id: userID,
      blocked_id: id,
    });

    if (error) {
      console.error("Failed to block user", error);
    } else {
      setSearch(""); // Clear input
      setResults([]);
      // Refresh blocked users
      const { data } = await supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", userID);
      setBlockedUsers(data || []);
    }
  };

  const unblockUser = async (id: string) => {
    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .match({ blocker_id: userID, blocked_id: id });

    if (error) {
      console.error("Failed to unblock user", error);
    } else {
      fetchBlockedUsers()
    }
  };

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setSearch("");       // Clear the input
      setResults([]);      // Hide results
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6 text-gray-800">
      <div className="flex justify-between">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        🚫 Block User
      </h2>

      <div ref={dropdownRef} className="relative w-60">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="border p-2 w-full rounded"
          autoFocus
        />
        {search && results.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border rounded mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
            {results.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center p-2 hover:bg-gray-100"
              >
                <div>
                  <div className="font-medium">
                    {user.firstname} {user.lastname}
                  </div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
                <Button
                  onClick={() => blockUser(user.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 text-xs"
                >
                  Block
                </Button>
              </div>
            ))}
          </div>
        )}
        {search && results.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No users found</p>
        )}
      </div>
      </div>



      {blockedUsers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Blocked Users</h3>
          {blockedUsers.map((item: any) => (
            <div
              key={item?.blocked_id}
              className="flex justify-between items-center border p-3 rounded shadow-sm"
            >
              <div onClick={() => { setActiveTab("user-profile"), setSelectedUserId(item?.user_profiles?.id)}} className="flex items-center cursor-pointer space-x-3">
                {item?.user_profiles?.avatar ? (
                  <img
                    src={item?.user_profiles?.avatar}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">
                    {item?.user_profiles?.firstname?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">
                    {item?.user_profiles?.firstname}{" "}
                    {item?.user_profiles?.lastname}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{item?.user_profiles?.username}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => unblockUser(item?.blocked_id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      )}


      <p>
        Sometimes, the best choice you can make is… <em>neither.</em>
      </p>

      <p>
        We get it — social media’s a place to spark fun debates, hear different opinions, and maybe even laugh at your
        friends’ questionable takes. But every now and then, someone’s vibe just doesn’t vibe with yours. That’s where the
        Block User feature comes in.
      </p>

      <h3 className="text-lg font-semibold mt-4">✋ What happens when you block someone?</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>They won’t be able to follow you anymore.</li>
        <li>They won’t see your Wyras on their feed or in your Circles.</li>
        <li>They won’t be able to DM you.</li>
        <li>You won’t see their Wyras or Why’s either.</li>
        <li>Peace of mind restored.</li>
      </ul>

      <p>
        It’s like putting up a polite but firm <q>Do Not Disturb</q> sign — no drama, no notifications sent to them.
        They’ll just quietly vanish from your Wyra world.
      </p>

      <h3 className="text-lg font-semibold mt-4">🤔 Can you unblock later?</h3>
      <p>
        Absolutely. People grow. Moods change. If you ever feel like giving them another shot, you can unblock them anytime
        from your Settings &gt; Privacy &gt; Blocked Users list.
      </p>

      <h3 className="text-lg font-semibold mt-4">🔍 How do you block someone?</h3>
      <p>It’s easy:</p>
      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Go to their profile page.</li>
        <li>Tap or click the three vertical dots in the corner.</li>
        <li>Select Block User.</li>
        <li>Confirm when asked. Done.</li>
      </ol>

      <p>
        Or, if you come across one of their Wyras in your feed and think, “Yeah… nah,” you can also hit the three-dot menu
        on their post and select Block User from there.
      </p>

      <p>
        ❤️ Because your Wyra experience should feel like your choice.
      </p>

      <p>
        Here at Wyra, we’re all about the questions — but who shows up on your feed? That’s totally your call.
      </p>

      <p>
        So go ahead: block confidently, unblock graciously, and keep curating the kind of conversations you actually want
        to have.
      </p>

      <h3 className="text-lg font-semibold mt-4">Still have questions?</h3>
      <p>
        Slide into our inbox at{" "}
        <a href="mailto:info@wyra.xyz" className="text-indigo-600 hover:underline">
          info@wyra.xyz
        </a>{" "}
        — we’re here to help.
      </p>

      <p>Happy Wyra-ing!</p>

      <p className="font-semibold text-center text-lg mt-8">
        Would you rather… let that bad energy linger? <br />
        Or block and move on? 😉
      </p>
    </div>
  );
}
