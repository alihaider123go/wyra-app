"use client";

import CircleList from "@/components/circle/CircleList";
import { createClient } from "@/utils/supabase/client";
import WyraTimeLine from "@/components/wyra/TimeLine";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Settings from "@/components/account/Settings";

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
      <Settings user={user} />
      {/* <WyraTimeLine /> */}

      {/* <CircleList currentUser={user} /> */}
    </main>
  );
}

