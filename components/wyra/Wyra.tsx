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
    ThumbsUp,
    ThumbsDown,
    Circle,
    ShieldMinus,
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
import CustomAvatar from "../ui/custom-avatar";
import WyraSelectedOptionLikeButton from "./WyraSelectedOptionLikeButton";
import WyraSelectedOptionDislikeButton from "./WyraSelectedOptionDislikeButton";

export default function WyraSection({
    wyras,
    fetchWyras,
    searchTerm,
    postId,
    setActiveTab,
    setSelectedUserId
}: any) {
    const [loading, setLoading] = useState(true);
    const [showCreateWyraModal, setShowCreateWyraModal] = useState(false);
    const [showEditWyraModal, setShowEditWyraModal] = useState({ isShow: false, id: "" });
    const [blockModal, setBlockModal] = useState<any>({ isOpen: false, userId: null, action: "" });
    const [user, setUser] = useState<User | null>(null);
    const [wyrasWithCircles, setWyrasWithCircles] = useState<any[]>([]);
    const [selectedWyraOption, setSelectedWyraOption] = useState<any>();
    const [whyText, setWhyText] = useState<any>();
    const router = useRouter();
    const [expandedWyras, setExpandedWyras] = useState<{ [key: string]: boolean }>({});

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
        if (searchTerm) {
            const handler = setTimeout(() => {
                setDebouncedSearch(searchTerm);
            }, 500); // 500ms debounce

            return () => {
                clearTimeout(handler);
            };
        }
    }, [searchTerm]);

    const supabase = createClient();

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
            const result = await getWyrasWithCircles(user.id, debouncedSearch);
            setWyrasWithCircles(result || []);
        } catch (err) {
            console.error("Failed to fetch wyras", err);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    }

    useEffect(() => {
        fetchCircleWyras();
    }, []);

    useEffect(() => {
        if (!user) return;
        async function fetchFollowStatusForAll() {
            const uniqueProfileUserIds = Array.from(
                new Set(
                    wyras.map((w: any) => w.created_by).filter((id: any) => id !== user?.id)
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
            const followMap: any = {};
            uniqueProfileUserIds.forEach((id: any) => {
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
    }, [user, wyras, supabase]);

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
                    const isAllowed = await isNotificationAllowed(profileUserId, "follow_me")
                    if (isAllowed) {
                        await supabase.from("notifications").insert([
                            {
                                type: "follow",
                                sender_id: user.id,
                                recipient_id: profileUserId,
                                post_id: null,
                                message: "is following you",
                            },
                        ]);
                    }
                    setFollowStatus((prev) => ({ ...prev, [profileUserId]: true }));
                }
            }
        } catch (err) {
            console.error("Error toggling follow", err);
        } finally {
            setLoadingStatus((prev) => ({ ...prev, [profileUserId]: false }));
        }
    };


    const blockWyra = async (profileUserId: string) => {
        if (!user) return;
        setLoadingStatus((prev) => ({ ...prev, [profileUserId]: true }));

        try {
            const { error } = await supabase
                .from("user_blocks")
                .upsert([{ blocker_id: user.id, blocked_id: profileUserId }], {
                    onConflict: "blocker_id,blocked_id",
                });

            if (!error) {
                fetchWyras()
            }

        } catch (err) {
            console.error("Error toggling follow", err);
        } finally {
            setLoadingStatus((prev) => ({ ...prev, [profileUserId]: false }));
        }
    };

    const unblockWyra = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("user_blocks")
            .delete()
            .match({ blocker_id: user.id, blocked_id: id });

        if (error) {
            console.error("Failed to unblock user", error);
        } else {
            fetchWyras()
        }
    };

    useEffect(() => {
        if (postId) {
            const element = document.getElementById(postId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [postId, wyras]);

    const handleSubmitWyraOption = async (wyraId: any) => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from("wyra_selected_option")
            .upsert(
                {
                    wyra_id: wyraId,
                    user_id: user.id,
                    selected_option_id: selectedOptions[wyraId],
                    why: whyText,
                },
                {
                    onConflict: "wyra_id,user_id", // ✅ must be a string
                }
            )
            .select();

        if (error) {
            console.error("Error saving option:", error);
        } else {
            fetchWyras();
            setWhyText("");
            setIsShowWhyReasonContainer([]);
        }
    };


    const handleDeleteWyra = async (id: any) => {
        const isDelete = await deleteWyra(id);
        if (isDelete.success) {
            fetchWyras()
            fetchCircleWyras()
        }
    }

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!wyras.length)
        return <div className="text-center py-10">No Wyras yet.</div>;


    return (
        <>
            <div className="w-full space-y-6">
                {
                    wyras.map((wyra: any) => (
                        <Card
                            key={wyra.id}
                            id={wyra.id}
                            className={`shadow-md hover:shadow-2xl border-0 bg-white dark:bg-black/80 backdrop-blur-lg transition-all pt-4 animate-slide-in-right ${postId === wyra.id ? "shadow-2xl shadow-blue-500" : ""
                                }`}              >
                            <CardContent>
                                <div className="flex md:gap-2">
                                    {/* user info */}
                                    <div onClick={() => { setActiveTab("user-profile"), setSelectedUserId(wyra.creator?.id) }} className="flex items-center cursor-pointer gap-3 w-full">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800  relative">
                                            <CustomAvatar userId={wyra.creator?.id} firstName={wyra.creator.firstname} lastName={wyra.creator.lastname} />
                                            <UserOnlineStatus userId={wyra.creator?.id} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-black dark:text-white">
                                                {wyra.creator.firstname} {wyra.creator.lastname}
                                                <span>
                                                    <span className="font-bold text-md mt-6">
                                                        {" "}
                                                        Asked{wyra?.wyra_circles?.length > 0 && wyra?.wyra_circles[0]?.circle?.name && " in"}{wyra?.wyra_circles?.length > 0 && wyra?.wyra_circles?.map((item: any, index: any) => {
                                                            return (
                                                                <span key={index}>
                                                                    {item?.circle?.name &&
                                                                        <span className="text-sm italic"> {item?.circle?.name} </span>

                                                                    }
                                                                </span>
                                                            )
                                                        })},{" "}
                                                    </span>
                                                    <small className="text-gray-500 dark:text-gray-200">
                                                        {relativeTime(wyra.created_at)}
                                                    </small>

                                                </span>
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
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
                                                    className="dark:bg-gray-800 dark:hover:bg-gray-800 rounded-full"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="end"
                                                className="w-48 bg-white dark:bg-black mt-1"
                                            >
                                                {user?.id === wyra.created_by ? (
                                                    <>
                                                        <DropdownMenuItem onClick={() => { setShowEditWyraModal({ isShow: true, id: wyra.id }) }} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Wyra
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { handleDeleteWyra(wyra.id) }} className="text-red-600 cursor-pointer hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Wyra
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
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
                                                        {
                                                            wyra?.is_blocked ? (
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                                                                    onClick={() => setBlockModal({ isOpen: true, userId: wyra?.created_by, action: "unblock" })}
                                                                >
                                                                    <ShieldMinus className="w-4 h-4 mr-2" />
                                                                    Unblock User
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    className="text-red-600 cursor-pointer hover:bg-red-50"
                                                                    onClick={() => setBlockModal({ isOpen: true, userId: wyra?.created_by, action: "block" })}
                                                                >
                                                                    <CircleOff className="w-4 h-4 mr-2" />
                                                                    Block User
                                                                </DropdownMenuItem>
                                                            )
                                                        }

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
                                            const match = wyra.wyra_selected_option?.find(
                                                (item: any) => item.user_profiles?.id === user?.id
                                            );
                                            const isSelected = !selectedOptions[wyra.id] ? match?.selected_option_id === opt.id : selectedOptions[wyra.id] === opt.id;

                                            const isAlreadySelect = false;
                                            // wyra.wyra_selected_option[0]?.selected_option_id
                                            const isDisabled =
                                                // (selectedOptions[wyra.id] != null &&
                                                //     selectedOptions[wyra.id] !== opt.id
                                                // ) || 
                                                wyra.creator?.id === user?.id;
                                            return (
                                                <React.Fragment key={opt.id}>
                                                    {index === 1 && (
                                                        <span className="w-12 h-12 px-4 text-white dark:text-black rounded-full flex justify-center items-center text-sm font-semibold  bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-600 hover:to-blue-900">
                                                            OR
                                                        </span>
                                                    )}

                                                    <div
                                                        className={`
            my-3 relative overflow-hidden border shadow p-4 rounded-lg cursor-pointer w-full md:w-1/2 transition-all duration-300 transform hover:scale-[1.02]
            ${isSelected
                                                                ? "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-700"
                                                                : "hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800"
                                                            }
            ${isDisabled || isAlreadySelect
                                                                ? "cursor-not-allowed pointer-events-none opacity-70"
                                                                : ""
                                                            }
          `}
                                                        onClick={() => {
                                                            if (match?.selected_option_id === opt.id) {
                                                                setSelectedOptions((prev: any) => ({
                                                                    ...prev,
                                                                    [wyra.id]: null,
                                                                }));
                                                                setIsShowWhyReasonContainer((prev) => ({
                                                                    ...prev,
                                                                    [wyra.id]: false, // toggle open/close per wyra
                                                                }));

                                                            } else {
                                                                setSelectedOptions((prev: any) => ({
                                                                    ...prev,
                                                                    [wyra.id]:
                                                                        prev[wyra.id] === opt.id ? null : opt.id, // toggle selection per wyra
                                                                }));

                                                                setIsShowWhyReasonContainer((prev) => ({
                                                                    ...prev,
                                                                    [wyra.id]: prev[wyra.id] && isSelected ? false : true, // toggle open/close per wyra
                                                                }));

                                                                setWhyText(match?.why || "");

                                                            }

                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <small className="absolute top-0 right-0 rounded-l-lg bg-white dark:bg-black px-1">
                                                                Selected
                                                            </small>
                                                        )}
                                                        {
                                                            opt.is_edit &&
                                                            <>
                                                                {
                                                                    isSelected
                                                                        ?
                                                                        <small
                                                                            className={`absolute bottom-0 right-0  rounded-l-lg px-1 text-blue-500 font-semibold bg-white dark:bg-black`}
                                                                        >
                                                                            edited
                                                                        </small>

                                                                        :
                                                                        <small
                                                                            className={`absolute bottom-0 right-0  rounded-l-lg px-1 text-white dark:text-black font-semibold bg-blue-500`}
                                                                        >
                                                                            edited
                                                                        </small>

                                                                }
                                                            </>
                                                        }

                                                        <p
                                                            className={`text-sm font-medium mb-1 ${isSelected ? "text-white dark:text-black" : "text-gray-500 dark:text-gray-200"
                                                                }`}
                                                        >
                                                            Option {index + 1}:
                                                        </p>
                                                        <p
                                                            className={`font-bold text-lg mb-1 ${isSelected ? "text-white dark:text-black" : "text-gray-800 dark:text-gray-200"
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
                                {wyra?.wyra_selected_option?.length > 0 && !selectedOptions[wyra.id] && (
                                    <>
                                        <div className="border mb-2 p-2 rounded-lg">

                                            {(expandedWyras[wyra.id]
                                                ? wyra.wyra_selected_option
                                                : wyra.wyra_selected_option.slice(0, 3)
                                            ).map((item: any) => {
                                                return (
                                                    <div className={`my-2 ml-4 ${user?.id === item?.user_profiles?.id && item?.user_profiles?.account_settings?.multi_color_why_boxes ? "border rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white dark:text-black shadow-lg p-2" : "border-b"}`} key={item?.id}>
                                                        <div onClick={() => { setActiveTab("user-profile"), setSelectedUserId(item?.user_profiles?.id) }} className="flex cursor-pointer items-center">
                                                            <div className="relative w-12 h-12 rounded-full mr-2">
                                                                <CustomAvatar userId={item?.user_profiles?.id} firstName={item?.user_profiles.firstname} lastName={item?.user_profiles.lastname} />
                                                            </div>
                                                            <p className="font-medium text-left">
                                                                {`${item?.user_profiles.firstname} ${item?.user_profiles.lastname}`} Would rather:<br />
                                                                <span className="italic font-normal mb-2">
                                                                    {item?.wyra_option?.option_text}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="ml-12 rounded">
                                                            <div className="ml-2">
                                                                <div className="flex items-center my-2">
                                                                    <div className="flex-grow border-t"></div>

                                                                    <h3 className="mx-4 text-lg font-bold whitespace-nowrap">Why?</h3>

                                                                    <div className="flex-grow border-t"></div>
                                                                </div>

                                                                <p className="text-center italic">{item?.why}</p>
                                                            </div>
                                                            <div className="my-2 flex justify-center gap-2">
                                                                <WyraSelectedOptionLikeButton
                                                                    wyraSelectedOptionId={item?.id}
                                                                    userId={item?.user_profiles?.id}
                                                                    count={item.wyra_selected_option_reaction?.filter((r: any) => r.type === 'like').length || 0}
                                                                />
                                                                <WyraSelectedOptionDislikeButton
                                                                    wyraSelectedOptionId={item?.id}
                                                                    userId={item?.user_profiles?.id}
                                                                    count={item.wyra_selected_option_reaction?.filter((r: any) => r.type === 'dislike').length || 0}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                            {wyra.wyra_selected_option.length > 3 && (
                                                <button
                                                    onClick={() =>
                                                        setExpandedWyras((prev) => ({
                                                            ...prev,
                                                            [wyra.id]: !prev[wyra.id],
                                                        }))
                                                    }
                                                    className="mt-3 text-blue-600 w-full flex items-center justify-center"
                                                >
                                                    {expandedWyras[wyra.id] ? "Show less" : "Show more"}
                                                </button>
                                            )}

                                        </div>
                                    </>

                                )}
                                {isShowWhyReasonContainer[wyra.id] && (
                                    <div className="my-3 p-2 border shadow rounded-md ">
                                        <p className={`font-bold text-lg mb-1`}>Why? <span className="italic font-normal text-md">(Optional):</span></p>
                                        <div className="flex items-end">
                                            <Input
                                                id={`why-${wyra.id}`}
                                                name={`why-${wyra.id}`}
                                                type={"text"}
                                                value={whyText}
                                                onChange={(e) => { setWhyText(e.target.value) }}
                                                placeholder="Enter"
                                                className="h-12 mr-2 text-base placeholder:text-gray-400 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white dark:bg-black/90 backdrop-blur-sm"
                                                disabled={isWhyReasonSet[wyra.id] === true}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleSubmitWyraOption(wyra.id)
                                                }}
                                                className="h-8 px-2 rounded-xl bg-blue-500 text-white dark:text-black hover:bg-blue-600 transition"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <hr />
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-2 mt-5">
                                        <LikeButton wyraId={wyra.id} isFloatAllow={wyra.settings?.animate_floating_effects} userId={user?.id} count={wyra?.likeCount} />
                                        <DislikeButton wyraId={wyra.id} isFloatAllow={wyra.settings?.animate_floating_effects} userId={user?.id} count={wyra?.dislikeCount} />
                                        <CommentButton wyraId={wyra.id} userId={user?.id} />
                                        <FavouriteButton wyraId={wyra.id} isFloatAllow={wyra.settings?.animate_floating_effects} userId={user?.id} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-5">
                                        <ShareButton wyraId={wyra.id} userId={user?.id} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
            <Modal isOpen={showCreateWyraModal} hideCloseButton={true}>
                <ModalContent>
                    <ModalHeader className="flex flex-col justify-center items-center gap-1">
                        Create Wyra
                        <button
                            onClick={() => setShowCreateWyraModal(false)}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 focus:outline-none"
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
            <Modal isOpen={blockModal?.isOpen} hideCloseButton={true}>
                <ModalContent>
                    <ModalHeader>
                        {blockModal?.action === "block" ? "Block User" : "Unblock User"}
                        <button
                            onClick={() => setBlockModal({ isOpen: false, userId: null, action: "" })}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900  focus:outline-none"
                            aria-label="Close block modal"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </ModalHeader>
                    <ModalBody>
                        <p>
                            {blockModal?.action === "block"
                                ? "Are you sure you want to block this user? You won't see their Wyras anymore."
                                : "Are you sure you want to unblock this user?"}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBlockModal({ isOpen: false, userId: null, action: "" })}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={blockModal?.action === "block" ? "bg-red-600 hover:bg-red-700 text-white dark:text-black" : ""}
                            onClick={async () => {
                                if (blockModal?.action === "block") {
                                    await blockWyra(blockModal?.userId);
                                } else {
                                    await unblockWyra(blockModal?.userId);
                                }
                                setBlockModal({ isOpen: false, userId: null, action: "" });
                            }}
                        >
                            {blockModal?.action === "block" ? "Block" : "Unblock"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={showEditWyraModal.isShow} hideCloseButton={true}>
                <ModalContent>
                    <ModalHeader className="flex flex-col justify-center items-center gap-1">
                        Edit Wyra
                        <button
                            onClick={() => { setShowEditWyraModal({ isShow: false, id: "" }) }}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 focus:outline-none"
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
