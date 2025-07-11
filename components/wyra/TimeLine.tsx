"use client";

import React, { useEffect, useState } from "react";
import { getUnifiedHomeWyras } from "@/actions/wyra";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LikeButton from "./LikeBtn";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FollowButton from "./FollowUnFollowBtn";
import { Tooltip } from "@heroui/tooltip";
import CreateWyra from "@/components/wyra/CreateWyra";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Home,
  Heart,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  X,
  SquareCheck,
  MessageCircle,
  User as UserIcon,
} from "lucide-react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import {  Modal,  ModalContent,  ModalHeader,  ModalBody,  ModalFooter} from "@heroui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

import { Wyra } from "@/actions/types";

export default function WyraTimeline() {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWyraModal, setShowCreateWyraModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("trending");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
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
      {/* <Link href="/create-wyra">
        <div className="bg-gray-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-gray-700 transition ">
          Create Wyra
        </div>
      </Link> */}
      <Tooltip className="bg-black text-white" color="success" content="Create Wyra">
        <Button onClick={() => setShowCreateWyraModal(true) } className="rounded-full h-12 w-12 fixed bottom-[5%] right-[5%] z-50">
          <Plus className="h-8 w-8 text-white"/>
        </Button>
      </Tooltip>

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
                    {/* <span className="font-bold text-lg mt-6">Asks,</span> */}
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
                {/* <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-black">
                    Would you rather...
                  </h2>
                  {user?.id && wyra?.created_by && (
                    <FollowButton
                      currentUserId={user?.id}
                      profileUserId={wyra.created_by}
                    />
                  )}
                </div> */}
                <div className="mt-3">
                  <span className="font-bold text-lg mt-6">Asks, </span><small className="text-gray-500">21 seconds ago</small>
                  <p className="my-3 font-bold text-xl text-center">
                    Would you rather:
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  {wyra.wyra_option
  .sort((a, b) => a.position - b.position)
  .map((opt: any, index: number) => {
    const isSelected = selectedOptionId === opt.id;
    const isDisabled = selectedOptionId !== null && !isSelected;

    return (
      <React.Fragment key={opt.id}>
        {index === 1 && (
          <span className="w-12 h-12 text-white rounded-full flex justify-center items-center text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-600 hover:to-blue-900">
            OR
          </span>
        )}

        <div
          className={`
            my-3 relative overflow-hidden border shadow p-4 rounded-lg cursor-pointer w-full md:w-1/2 transition-all duration-300 transform hover:scale-[1.02]
            ${isSelected ? "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-700" : "hover:bg-gray-100"}
            ${isDisabled ? "cursor-not-allowed pointer-events-none opacity-70" : ""}
          `}
          onClick={() => {
            if (!selectedOptionId) {
              setSelectedOptionId(opt.id);
            }
          }}
        >
          {isSelected && (
            <small className="absolute top-0 right-0 rounded-l-lg bg-white px-1">
              Selected
            </small>
          )}

          <p className={`text-sm font-medium mb-1 ${isSelected ? "text-white" : "text-gray-500"}`}>
            Option {index + 1}:
          </p>
          <p className={`font-bold text-lg mb-1 ${isSelected ? "text-white" : "text-gray-800"}`}>
            {opt.option_text}
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
      </React.Fragment>
    );
  })}
                </div>
                <div className="flex items-center gap-2 mt-5">
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
        <Modal isOpen={showCreateWyraModal} hideCloseButton={true}>
          <ModalContent>
              <ModalHeader className="flex flex-col justify-center items-center gap-1">
                Create Wyra
              <button
                        onClick={() => setShowCreateWyraModal(false)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
                        aria-label="Close comment modal"
                      >
                        <X className="w-6 h-6" />
                      </button>
              </ModalHeader>

              <ModalBody>
                  <CreateWyra />
              </ModalBody>
              {/* <ModalFooter className="flex justify-between">
                  <Button className="w-full h-14 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" onClick={() => setShowCreateWyraModal(false)}>
                  No
                  </Button>
                  <Button className="w-full h-14 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" onClick={() => setShowCreateWyraModal(false)}>
                  Yes
                  </Button>
              </ModalFooter> */}
          </ModalContent>
      </Modal>
    </>
  );
}
