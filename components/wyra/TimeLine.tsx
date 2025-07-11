"use client";

import React, { useEffect, useState } from "react";
import { getUnifiedHomeWyras } from "@/actions/wyra";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LikeButton from "./LikeBtn";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FollowButton from "./FollowUnfollowButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, Flag } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Wyra } from "@/actions/types";

export default function WyraTimeline() {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("trending");

  // Map to track follow status per profileUserId
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>(
    {}
  );

  const supabase = createClient();

  // Fetch wyras & current user
  useEffect(() => {
    async function fetchWyras() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      } else {
        setUser(user);
      }

      try {
        const result = await getUnifiedHomeWyras(user.id);
        setWyraList(result || []);
      } catch (err) {
        console.error("Failed to fetch wyras", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWyras();
  }, []);

  // Fetch follow status for all unique profileUserIds when user or wyraList changes
  useEffect(() => {
    if (!user) return;
    async function fetchFollowStatusForAll() {
      const uniqueProfileUserIds = Array.from(
        new Set(
          wyraList.map((w) => w.created_by).filter((id) => id !== user?.id)
        )
      );

      // Query user_followers table for all following relations
      const { data, error } = await supabase
        .from("user_followers")
        .select("following_id")
        .eq("follower_id", user?.id)
        .in("following_id", uniqueProfileUserIds);

      if (error) {
        console.error("Failed to fetch follow statuses", error);
        return;
      }

      // Create map of profileUserId -> true if following
      const followMap: Record<string, boolean> = {};
      uniqueProfileUserIds.forEach((id) => {
        followMap[id] = false;
      });
      if (data) {
        data.forEach((row) => {
          followMap[row.following_id] = true;
        });
      }

      setFollowStatus(followMap);
    }

    fetchFollowStatusForAll();
  }, [user, wyraList, supabase]);

  // Handler to toggle follow/unfollow for a given profileUserId
  const toggleFollow = async (profileUserId: string) => {
    if (!user) return;
    setLoadingStatus((prev) => ({ ...prev, [profileUserId]: true }));

    try {
      if (followStatus[profileUserId]) {
        // Unfollow
        const { error } = await supabase
          .from("user_followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileUserId);

        if (!error) {
          setFollowStatus((prev) => ({ ...prev, [profileUserId]: false }));
        }
      } else {
        // Follow
        const { error } = await supabase
          .from("user_followers")
          .upsert([{ follower_id: user.id, following_id: profileUserId }], {
            onConflict: "follower_id,following_id",
          });

        if (!error) {
          setFollowStatus((prev) => ({ ...prev, [profileUserId]: true }));
        }
      }
    } catch (err) {
      console.error("Error toggling follow", err);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, [profileUserId]: false }));
    }
  };

  if (loading) return <div className="text-center py-10">Loading Wyras...</div>;
  if (!wyraList.length)
    return <div className="text-center py-10">No Wyras yet.</div>;

  const tabs = [
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "recent", icon: Clock, label: "Recent" },
    { id: "following", icon: Sparkles, label: "Following" },
  ];

  return (
    <>
      <Link href="/create-wyra">
        <div className="bg-gray-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-gray-700 transition">
          Create Wyra
        </div>
      </Link>

      <div className="w-full flex items-center justify-around gap-4 py-2 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 rounded-2xl transition-all duration-300 transform ${
                isActive
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? "animate-bounce-slow" : ""}`}
              />
              <span
                className={`text-xs mt-1 font-semibold ${
                  isActive ? "text-white" : ""
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "trending" ? (
        <div className="max-w-3xl space-y-6">
          {wyraList.map((wyra) => (
            <Card
              key={wyra.id}
              className="shadow-md hover:shadow-2xl border-0 bg-white/80 backdrop-blur-lg transition-all pt-4 animate-slide-in-right"
            >
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {/* user info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={wyra.creator.avatar}
                        alt="avatar preview"
                        className="w-full h-full shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black">
                        {wyra.creator.firstname} {wyra.creator.lastname}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        @{wyra.creator.username}
                      </p>
                    </div>
                  </div>

                  {/* dropdown menu */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 rounded-full"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white mt-1"
                      >
                        {user?.id === wyra.created_by ? (
                          <>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Wyra
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Wyra
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
                              <FollowButton
                                isFollowing={
                                  followStatus[wyra.created_by] ?? false
                                }
                                loading={
                                  loadingStatus[wyra.created_by] ?? false
                                }
                                toggleFollow={() =>
                                  toggleFollow(wyra.created_by)
                                }
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50">
                              <Flag className="w-4 h-4 mr-2" />
                              Report Wyra
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Wyra options */}
                {wyra.wyra_option
                  .sort((a, b) => a.position - b.position)
                  .map((opt, index) => (
                    <div key={opt.id} className="mb-4">
                      <p className="text-gray-800 font-medium mb-1">
                        Option {index + 1}: {opt.option_text}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {opt.wyra_media.map((media: any) => (
                          <div key={media.id} className="w-32">
                            {media.media_type === "image" ? (
                              <img
                                src={media.media_url}
                                alt="Option media"
                                className="rounded-md object-cover max-h-28 w-full"
                              />
                            ) : (
                              <video
                                src={media.media_url}
                                controls
                                className="rounded-md max-h-28 w-full"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <LikeButton wyraId={wyra.id} userId={user?.id} />
                  <DislikeButton wyraId={wyra.id} userId={user?.id} />
                  <CommentButton wyraId={wyra.id} userId={user?.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeTab === "recent" ? (
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Recent feeds will be shown here...</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Following
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Following feeds will be shown here...</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
