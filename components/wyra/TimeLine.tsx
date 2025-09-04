"use client";

import React, { useEffect, useState } from "react";
import { deleteWyra, getUnifiedHomeWyras, getWyrasWithCircles } from "@/actions/wyra";
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
  Users,
  CircleOff,
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
import { isNotificationAllowed, isSettingAllowed, relativeTime } from "@/utils/helper";
import ShareButton from "./ShareBtn";
import FavouriteButton from "./FavouriteBtn";
import UserOnlineStatus from "../ui/userOnlineStatus";
import EditWyra from "./EditWyra";
import CirclesWyras from "./CirclesWyra";
import { useRouter } from "next/navigation";
import WyraSection from "./Wyra";
import Loader from "../common/loader";
import { FaUsers } from "react-icons/fa";

export default function WyraTimeline({ searchTerm, postId, setActiveTab, setSelectedUserId }: any) {
  const [wyraList, setWyraList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wyraLoading, setWyraLoading] = useState(true);
  const [showCreateWyraModal, setShowCreateWyraModal] = useState(false);
  const [showEditWyraModal, setShowEditWyraModal] = useState({ isShow: false, id: "" });
  const [user, setUser] = useState<User | null>(null);
  const [wyrasWithCircles, setWyrasWithCircles] = useState<any[]>([]);
  const [selectedWyraOption, setSelectedWyraOption] = useState<any>();
  const [whyText, setWhyText] = useState<any>();
  const router = useRouter();
  const [expandedWyras, setExpandedWyras] = useState<{ [key: string]: boolean }>({});

  const [activeFeatureTab, setActiveFeatureTab] = useState<string>("recent");
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

  const fetchWyras = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("User not logged in");

      setTimeout(() => setLoading(false), 1000);
      return;
    } else {
      setUser(user);
    }

    try {
      setWyraLoading(true)
      const result = await getUnifiedHomeWyras(user.id, debouncedSearch);
      setWyraList(result || []);
      setTimeout(() => setWyraLoading(false), 1000);

    } catch (err) {
      console.error("Failed to fetch wyras", err);
      setTimeout(() => setWyraLoading(false), 1000);

    } finally {
      setTimeout(() => setLoading(false), 1000);
      setTimeout(() => setWyraLoading(false), 1000);

    }
  }

  useEffect(() => {
    fetchWyras();
  }, [debouncedSearch]);


  const fetchCircleWyras = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("User not logged in");
      setTimeout(() => setLoading(false), 1000);
      return;
    } else {
      setUser(user);
    }

    try {
      setWyraLoading(true)
      const result = await getWyrasWithCircles(user.id, debouncedSearch);
      setWyrasWithCircles(result || []);

    } catch (err) {
      console.error("Failed to fetch wyras", err);

    } finally {
      setTimeout(() => setLoading(false), 1000);
      setTimeout(() => setWyraLoading(false), 1000);

    }
  }

  useEffect(() => {
    fetchCircleWyras();
  }, [debouncedSearch]);

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

  useEffect(() => {
    if (postId) {
      const element = document.getElementById(postId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [postId, wyraList]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  // if (!wyraList.length)
  //   return <div className="text-center py-10">No Wyras yet.</div>;

  const tabs = [
    { id: "recent", icon: Clock, label: "Recent", isImage: false },
    { id: "trending", icon: TrendingUp, label: "Trending", isImage: false },
    { id: "circles", icon: "/team.png", label: "Circles", isImage: true },
    { id: "following", icon: Sparkles, label: "Following", isImage: false },
  ];

  return (
    <>
      <Tooltip
        className="bg-black text-white"
        color="success"
        content="Create Wyra"
      >
        <Button
          onClick={() => setShowCreateWyraModal(true)}
          className="rounded-full h-12 w-12 fixed bottom-[5%] right-[5%] z-50 hidden md:flex items-center justify-center"
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </Tooltip>

      <div className="max-w-3xl flex items-center justify-around gap-4 py-2 px-2">
        {tabs.map((tab: any) => {
          const isActive = activeFeatureTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFeatureTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 rounded-2xl transition-all duration-300 transform ${isActive
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
            >
              {
                tab.isImage
                  ?
                    <FaUsers 
                      className={`w-6 h-6 ${isActive ? "animate-bounce-slow" : ""}`}
                    />
                  :
                  <Icon
                    className={`w-6 h-6 ${isActive ? "animate-bounce-slow" : ""}`}
                  />
              }

              <span
                className={`text-xs mt-1 font-semibold ${isActive ? "text-white" : ""
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-w-3xl">
        {
          !wyraLoading
            ?
            <>

              {activeFeatureTab === "trending" ? (
                <WyraSection
                  wyras={wyraList.filter((wyra: any) => wyra.likeCount > 20)}
                  fetchWyras={fetchWyras}
                  searchTerm={searchTerm}
                  postId={postId}
                  setActiveTab={setActiveTab}
                  setSelectedUserId={setSelectedUserId}
                />

              ) : activeFeatureTab === "recent" ? (
                <WyraSection
                  wyras={wyraList}
                  fetchWyras={fetchWyras}
                  searchTerm={searchTerm}
                  postId={postId}
                  setActiveTab={setActiveTab}
                  setSelectedUserId={setSelectedUserId}
                />
              ) : activeFeatureTab === "circles" ? (
                <div>
                  <CirclesWyras
                    wyras={wyrasWithCircles}
                    fetchWyras={fetchCircleWyras}
                    searchTerm={searchTerm}
                    postId={postId}
                    setActiveTab={setActiveTab}
                    setSelectedUserId={setSelectedUserId}
                  />
                </div>
              ) : (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      Following
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Feeds from people you follow will be shown here.</p>
                  </CardContent>
                </Card>
              )}
            </>
            :
            <div className="flex justify-center mt-10">
              <Loader
                height={16}
                width={16}
              />
            </div>
        }
      </div>
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
        </ModalContent>
      </Modal>
      <Modal isOpen={showEditWyraModal.isShow} hideCloseButton={true}>
        <ModalContent>
          <ModalHeader className="flex flex-col justify-center items-center gap-1">
            Edit Wyra
            <button
              onClick={() => { setShowEditWyraModal({ isShow: false, id: "" }) }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Close comment modal"
            >
              <X className="w-6 h-6" />
            </button>
          </ModalHeader>

          <ModalBody>
            <EditWyra wyraId={showEditWyraModal.id} fetchWyras={fetchWyras} setShowEditWyraModal={setShowEditWyraModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
