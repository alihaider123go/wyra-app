"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import UserProfileHeader from "./ProfileHeader";
import CircleList from "../circle/CircleList";
import MyWyras from "../wyra/MyWyras";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/common/loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddedCircles from "../circle/AddedCircleList";

// ShadCN Modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

interface ProfileProps {
  userId: string | undefined;
  setActiveTab?: any;
  setSelectedUserId?: any;
}

interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string;
  avatar: string | null;
  bio: string | null;
  account_settings?: any;
}

export default function Profile({
  userId,
  setActiveTab,
  setSelectedUserId,
}: ProfileProps) {
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wyrasCount, setWyrasCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCircleTab, setActiveCircleTab] = useState<
    "myCircles" | "addedCircles"
  >("myCircles");

  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users inside modal
  const filteredUsers = useMemo(() => {
    const list = modalType === "followers" ? followersList : followingList;
    return list.filter((u: any) =>
      u?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, modalType, followersList, followingList]);

  // Fetch profile data
  useEffect(() => {
    async function fetchAllProfileData() {
      setLoading(true);
      setError(null);

      try {
        // 1) Profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select(
            `*, account_settings (
              show_circles_on_profile
            )`
          )
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData as UserProfile);

        // 2) Wyras Count
        const { count: wyraCount, error: wyraError } = await supabase
          .from("wyra")
          .select("id", { count: "exact", head: true })
          .eq("created_by", userId);

        if (wyraError) throw wyraError;
        setWyrasCount(wyraCount || 0);

        // 3) Followers
        const { data: followersData, error: followersError } = await supabase
          .from("user_followers")
          .select(
            `follower:user_profiles!user_followers_follower_id_fkey (
              id,
              firstname,
              lastname,
              username,
              avatar
            )`
          )
          .eq("following_id", userId);

        if (followersError) throw followersError;
        setFollowersCount(followersData?.length || 0);
        setFollowersList(followersData?.map((f: any) => f.follower) || []);

        // 4) Following
        const { data: followingData, error: followingError } = await supabase
          .from("user_followers")
          .select(
            `following:user_profiles!user_followers_following_id_fkey (
              id,
              firstname,
              lastname,
              username,
              avatar
            )`
          )
          .eq("follower_id", userId);

        if (followingError) throw followingError;
        setFollowingCount(followingData?.length || 0);
        setFollowingList(followingData?.map((f: any) => f.following) || []);
      } catch (err: any) {
        console.log(err, "err");
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchAllProfileData();
  }, [userId]);

  const openModal = (type: "followers" | "following") => {
    setModalType(type);
    setShowModal(true);
    setSearchQuery("");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader width={10} height={10} color="border-gray-700" />
      </div>
    );

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!profile) return <div className="p-6">No profile found.</div>;

  return (
    <>
      {/* ===== Followers / Following Modal ===== */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-white dark:bg-black/80">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {modalType === "followers" ? "Followers" : "Following"}
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <Input
            placeholder="Search username..."
            className="mb-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* User List */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/default.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div
                      className="relative w-10 h-10 rounded-full p-[2px]
                 bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center
                   bg-white dark:bg-black text-gray-700 dark:text-gray-300 font-bold text-lg"
                      >
                        {user?.firstname[0] + user?.lastname[0]}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="font-medium">
                      {user.firstname} {user.lastname}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">No users found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Profile Card ===== */}
      <Card className="shadow-2xl border-0 bg-white dark:bg-black/80 backdrop-blur-lg animate-slide-in-right">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Profile
          </CardTitle>
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
            onFollowersClick={() => openModal("followers")}
            onFollowingClick={() => openModal("following")}
            onEditProfile={() => {
              window.location.href = "/settings/profile";
            }}
            onShareProfile={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          />
        </CardContent>
      </Card>

      {/* ===== Circles ===== */}
      <Card className="mt-[50px] shadow-2xl border-0 bg-white dark:bg-black/80 backdrop-blur-lg animate-slide-in-right">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Circles
          </CardTitle>
        </CardHeader>

        {profile?.account_settings?.show_circles_on_profile && (
          <div className="flex justify-center gap-4 border-b pb-2">
            <Button
              variant={activeCircleTab === "myCircles" ? "default" : "ghost"}
              onClick={() => setActiveCircleTab("myCircles")}
            >
              My Circles
            </Button>
            <Button
              variant={activeCircleTab === "addedCircles" ? "default" : "ghost"}
              onClick={() => setActiveCircleTab("addedCircles")}
            >
              Added Circles
            </Button>
          </div>
        )}

        <CardContent className="pt-6">
          {activeCircleTab === "myCircles" && <CircleList userId={userId} />}
          {profile?.account_settings?.show_circles_on_profile &&
            activeCircleTab === "addedCircles" && (
              <AddedCircles userId={userId} />
            )}
        </CardContent>
      </Card>

      {/* ===== My Wyras ===== */}
      <Card className="mt-[50px] shadow-2xl border-0 bg-white dark:bg-black/80 backdrop-blur-lg animate-slide-in-right">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex justify-between">
            <span>My Wyras</span>
            <Link href="/create-wyra" passHref>
              <Button className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white dark:text-black font-medium rounded-lg transition">
                <Plus size={18} /> Create Wyra
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MyWyras
            userId={userId}
            setActiveTab={setActiveTab}
            setSelectedUserId={setSelectedUserId}
          />
        </CardContent>
      </Card>
    </>
  );
}
