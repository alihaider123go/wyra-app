"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/actions/types";
type ExtendedUser = User & {
  user_profile: UserProfile; // or replace `any` with your actual profile type
  isVerified?: boolean;
};
export function useSessionUser() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Added to
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setLoading(true);

      const user = data.user;
      const isVerified =
        user?.identities?.[0]?.identity_data?.email_verified ?? false;

      // Fetch user_profile data
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Merge auth user with profile data
      if (user && user.id) {
        setUser({
          ...user,
          user_profile: profileData || null,
          isVerified,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });
  }, []);

  return {
    user,
    userProfile: userProfile,
    loading,
    isVerified: user?.identities?.[0]?.identity_data?.email_verified ?? false,
  };
}
