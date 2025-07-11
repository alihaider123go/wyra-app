"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      console.log(data.user);
      const isVerified =
        data?.user?.identities?.[0]?.identity_data?.email_verified ?? false;
        console.log(isVerified)
      setLoading(false);
    });
  }, []);

  return {
    user,
    loading,
    isVerified: user?.identities?.[0]?.identity_data?.email_verified ?? false
  };
}
