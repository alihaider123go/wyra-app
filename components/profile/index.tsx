"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import UserProfileHeader from "./ProfileHeader";
import CircleList from "../circle/CircleList";
import MyWyras from "../wyra/MyWyras";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/common/loader";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Plus, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

interface ProfileProps {
  userId: string|undefined;
}

interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string;
  avatar: string | null;
  bio: string | null;
}

export default function Profile({ userId }: ProfileProps) {
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wyrasCount, setWyrasCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllProfileData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData as UserProfile);

        // Fetch Wyras count
        const { count: wyraCount, error: wyraError } = await supabase
          .from("wyra")
          .select("id", { count: "exact", head: true })
          .eq("created_by", userId);

        if (wyraError) throw wyraError;
        setWyrasCount(wyraCount || 0);

        // Followers: users who follow me
        const { count: followers, error: followersError } = await supabase
          .from("user_followers")
          .select("id", { count: "exact", head: true })
          .eq("following_id", userId);

        if (followersError) throw followersError;
        setFollowersCount(followers || 0);

        // Following: users I follow
        const { count: following, error: followingError } = await supabase
          .from("user_followers")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", userId);

        if (followingError) throw followingError;
        setFollowingCount(following || 0);
      } catch (err: any) {
        console.error("Error fetching profile:", err.message);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchAllProfileData();
  }, [userId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader width={10} height={10} color="border-gray-700" /></div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!profile) return <div className="p-6">No profile found.</div>;

  return (
    <>
     {/* Personal Information Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <UserProfileHeader
              user={{
                avatar: profile.avatar || "",
                fullName: `${profile.firstname ?? ""} ${
                  profile.lastname ?? ""
                }`.trim(),
                username: profile.username,
                bio: profile.bio ?? "",
                stats: {
                  wyras: wyrasCount,
                  followers: followersCount,
                  following: followingCount,
                },
              }}
              onEditProfile={() => {
                window.location.href = "/settings/profile";
              }}
              onShareProfile={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Profile link copied!");
              }}
            />
          </CardContent>
        </Card>


       {/* Circles Card */}
        <Card className="mt-[50px] shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">Circles</CardTitle>
          </CardHeader>
          <CardContent>
            <CircleList userId={userId} />
          </CardContent>
        </Card>

       {/* My Wyras Card */}
        <Card className="mt-[50px] shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800 flex justify-between">
              <span>
                My Wyras
              </span>
              <Link href="/create-wyra" passHref>
                <Button className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition">
                  <Plus size={18} /> Create Wyra
                </Button>
              </Link>

            </CardTitle>
          </CardHeader>
          <CardContent>
            <MyWyras userId={userId} />
          </CardContent>
        </Card>


    </>
  );
}
