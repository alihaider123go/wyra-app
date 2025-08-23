"use client";

import React, { useEffect, useState } from "react";
import { getFavoriteWyras, getUnifiedHomeWyras } from "@/actions/wyra";
import { createClient } from "@/utils/supabase/client";
import LikeButton from "./LikeBtn";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FollowButton from "./FollowUnfollowButton";
import { Tooltip } from "@heroui/tooltip";
import CreateWyra from "@/components/wyra/CreateWyra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  X,
  User as UserIcon,
} from "lucide-react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Wyra } from "@/actions/types";
import { relativeTime } from "@/utils/helper";
import ShareButton from "./ShareBtn";
import FavouriteButton from "./FavouriteBtn";
import UserOnlineStatus from "../ui/userOnlineStatus";

export default function FavoritesWyra({searchTerm}:any) {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWyraModal, setShowCreateWyraModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("trending");
  const [selectedOptions, setSelectedOptions] = useState<{
    [wyraId: number]: number | null;
  }>({});

  const [isShowWhyReasonContainer, setIsShowWhyReasonContainer] = useState<{
    [wyraId: number]: boolean;
  }>({});

  // For tracking if the "Why" reason is set per wyra
  const [isWhyReasonSet, setIsWhyReasonSet] = useState<{
    [wyraId: number]: boolean;
  }>({});
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  // Map to track follow status per profileUserId
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>(
    {}
  );
  // const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");


   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const supabase = createClient();

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
        const result = await getFavoriteWyras(user.id, debouncedSearch);
        setWyraList(result || []);
      } catch (err) {
        // console.error("Failed to fetch wyras", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWyras();
  }, [debouncedSearch]);

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

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!wyraList.length)
    return <div className="text-center py-10">No Wyras yet.</div>;

  return (
    <>
        <div className="max-w-3xl space-y-6">
          {wyraList.map((wyra: any) => (
            <Card
              key={wyra.id}
              className="shadow-md hover:shadow-2xl border-0 bg-white/80 backdrop-blur-lg transition-all pt-4 animate-slide-in-right"
            >
              <CardContent>
                <div className="flex md:gap-2">
                  {/* user info */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={wyra.creator.avatar}
                        alt="avatar preview"
                        className="w-full h-full shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded-full object-cover"
                      />
                      <UserOnlineStatus userId={wyra.creator?.id}/>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black">
                        {wyra.creator.firstname} {wyra.creator.lastname}
                        <span>
                          <span className="font-bold text-md mt-6">
                            {" "}
                            Asked,{" "}
                          </span>
                          <small className="text-gray-500">
                            {relativeTime(wyra.created_at)}
                          </small>
                        </span>
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
                <div className="mt-3">
                  <p className="my-3 font-bold text-xl text-center">
                    Would you rather:
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center md:gap-4 gap-2">
                  {wyra.wyra_option
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((opt: any, index: number) => {
                      const isSelected = selectedOptions[wyra.id] === opt.id;
                      const isDisabled =
                        selectedOptions[wyra.id] != null &&
                        selectedOptions[wyra.id] !== opt.id;

                      return (
                        <React.Fragment key={opt.id}>
                          {index === 1 && (
                            <span className="w-12 h-12 text-white rounded-full flex justify-center items-center text-sm font-semibold  bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-600 hover:to-blue-900">
                              OR
                            </span>
                          )}

                          <div
                            className={`
            my-3 relative overflow-hidden border shadow p-4 rounded-lg cursor-pointer w-full md:w-1/2 transition-all duration-300 transform hover:scale-[1.02]
            ${isSelected
                                ? "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-700"
                                : "hover:bg-gray-100"
                              }
            ${isDisabled
                                ? "cursor-not-allowed pointer-events-none opacity-70"
                                : ""
                              }
          `}
                            // onClick={() => {
                            //   if (!selectedOptionId) {
                            //     setSelectedOptionId(opt.id);
                            //   }
                            // }}
                            onClick={() => {
                              setSelectedOptions((prev: any) => ({
                                ...prev,
                                [wyra.id]:
                                  prev[wyra.id] === opt.id ? null : opt.id, // toggle selection per wyra
                              }));

                              setIsShowWhyReasonContainer((prev) => ({
                                ...prev,
                                [wyra.id]: prev[wyra.id] ? false : true, // toggle open/close per wyra
                              }));
                              setIsWhyReasonSet((prev) => ({
                                ...prev,
                                [wyra.id]: false, // reset "why" set when changing selection
                              }));
                            }}
                          >
                            {isSelected && (
                              <small className="absolute top-0 right-0 rounded-l-lg bg-white px-1">
                                Selected
                              </small>
                            )}

                            <p
                              className={`text-sm font-medium mb-1 ${isSelected ? "text-white" : "text-gray-500"
                                }`}
                            >
                              Option {index + 1}:
                            </p>
                            <p
                              className={`font-bold text-lg mb-1 ${isSelected ? "text-white" : "text-gray-800"
                                }`}
                            >
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
                {isShowWhyReasonContainer[wyra.id] && (
                  <div className="my-3 p-2 border shadow rounded-md ">
                    <p className={`font-bold text-lg mb-1`}>Why? <span className="italic font-normal text-md">(Optional):</span></p>
                    <div className="flex items-end">
                      <Input
                        id={`why-${wyra.id}`}
                        name={`why-${wyra.id}`}
                        type={"text"}
                        placeholder="Enter"
                        className="h-12 mr-2 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
                        disabled={isWhyReasonSet[wyra.id] === true}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsWhyReasonSet((prev) => ({
                            ...prev,
                            [wyra.id]: true,
                          }));
                        }}
                        className="h-8 px-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
                <hr />
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 mt-5">
                    <LikeButton wyraId={wyra.id} userId={user?.id} />
                    <DislikeButton wyraId={wyra.id} userId={user?.id} />
                    <CommentButton wyraId={wyra.id} userId={user?.id} />
                    <FavouriteButton wyraId={wyra.id} userId={user?.id} />
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <ShareButton wyraId={wyra.id} userId={user?.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </>
  );
}
