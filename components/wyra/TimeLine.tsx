"use client";

import React, { useEffect, useState } from "react";
import { getUnifiedHomeWyras } from "@/actions/wyra"; // path to your function
import { createClient } from "@/utils/supabase/client"; // your supabase client
import Link from "next/link";
import LikeButton from "./LikeBtn";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FollowButton from "./FollowUnFollowBtn";
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
  MessageCircle,
  User as UserIcon,
} from "lucide-react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WyraMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
}

interface WyraOption {
  id: string;
  option_text: string;
  position: number;
  wyra_media: WyraMedia[];
}

interface Wyra {
  id: string;
  title?: string;
  created_at: string;
  created_by: string;
  wyra_option: WyraOption[];
}
export default function WyraTimeline() {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("trending");

  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  useEffect(() => {
    async function fetchWyras() {
      const supabase = createClient();
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
        const result = await getUnifiedHomeWyras(user.id); // call query function
        setWyraList(result || []);
      } catch (err) {
        console.error("Failed to fetch wyras", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWyras();
  }, []);
  const tabs = [
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "recent", icon: Clock, label: "Recent" },
    { id: "following", icon: Sparkles, label: "Following" },
  ];

  if (loading) return <div className="text-center py-10">Loading Wyras...</div>;
  if (!wyraList.length)
    return <div className="text-center py-10">No Wyras yet.</div>;

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
      {activeTab == "trending" ? (
        <div className="max-w-3xl space-y-6">
          {wyraList.map((wyra) => (
            // <div key={wyra.id} className="bg-white border rounded-xl shadow p-5">
            <Card
              key={wyra.id}
              className="shadow-md hover:shadow-2xl border-0 bg-white/80 backdrop-blur-lg transition-all pt-4 animate-slide-in-right"
            >
              <CardContent>
                {/* <pre>{JSON.stringify(wyra, null, 2)}</pre> */}

                <div className="grid grid-cols-2 gap-3">
                  {/* user information */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                      {/* <UserIcon className="w-[35px] h-[35px] bg-white rounded-full"/> */}
                      <img
                        src="https://pzixhiavvjqqyuuxgihj.supabase.co/storage/v1/object/public/profile-avatars/68f8dc38-06b3-4bc1-b943-4f59439b6ff5/1751614700244-dragon-ball-z-wallpaper-preview.jpg"
                        alt="avatar preview"
                        className="w-full h-full shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black">
                        Ali Haider
                      </h2>
                      <p className="text-gray-600 text-sm">@alihaider123go</p>
                    </div>
                  </div>
                  {/* <div className="flex-1"> */}
                    <div className="flex justify-end">
                      {user?.id && wyra?.created_by && (
                        <FollowButton
                          currentUserId={user?.id}
                          profileUserId={wyra.created_by}
                        />
                      )}

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
                        <DropdownMenuContent align="end" className="w-48 bg-white mt-1">
                          {user?.id == wyra?.created_by ? (
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
                            <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50">
                              <Flag className="w-4 h-4 mr-2" />
                              Report Wyra
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  {/* </div> */}
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
                {wyra.wyra_option
                  .sort((a, b) => a.position - b.position)
                  .map((opt: any, index: number) => (
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
                <div className="flex items-center gap-2">
                  <LikeButton wyraId={wyra.id} userId={user?.id} />

                  <DislikeButton wyraId={wyra.id} userId={user?.id} />

                  <CommentButton wyraId={wyra.id} userId={user?.id} />
                </div>
              </CardContent>
            </Card>
            // </div>
          ))}
        </div>
      ) : activeTab == "recent" ? (
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
