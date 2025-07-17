"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/actions/types";

type ExtendedUser = User & {
  user_profile: UserProfile;
  isVerified?: boolean;
  isProfileCompleted?: boolean;
};

export function useSessionUser() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const authUser = data.user;

    const isVerified =
      authUser?.identities?.[0]?.identity_data?.email_verified ?? false;

    let profileData: UserProfile | null = null;
    if (authUser?.id) {
      const { data: fetchedProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      profileData = fetchedProfile;
    }

    const isProfileCompleted = !!(profileData?.bio && profileData?.avatar);

    if (authUser) {
      setUser({
        ...authUser,
        user_profile: profileData || ({} as UserProfile),
        isVerified,
        isProfileCompleted,
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    isVerified: user?.isVerified ?? false,
    isProfileCompleted: user?.isProfileCompleted ?? false,
    refetch: fetchUser, 
  };
}
