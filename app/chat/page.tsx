"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Chat from "@/components/chat";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);
  if (!user) return <div>Loading...</div>;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Chat userId={user?.id}/>
    </main>
  );
}

