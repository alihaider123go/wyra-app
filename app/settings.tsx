"use client";

import Settings from "@/components/account/Settings";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function SettingsPage() {
    const supabase = createClient();

    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      return setUser(data.user);
    });
  }, []);
  return (
      <Settings user={user} />
    
  );
}
