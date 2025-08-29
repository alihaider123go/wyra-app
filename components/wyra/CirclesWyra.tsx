"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Wyra } from "@/actions/types";
import { User } from "@supabase/supabase-js";
import { relativeTime } from "@/utils/helper";

import LikeButton from "./LikeBtn";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FavouriteButton from "./FavouriteBtn";
import ShareButton from "./ShareBtn";
import FollowButton from "./FollowUnfollowButton";
import UserOnlineStatus from "../ui/userOnlineStatus";
import EditWyra from "./EditWyra";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
} from "@heroui/modal";
import { MoreHorizontal, Trash2, Edit, Flag, X, CircleOff } from "lucide-react";

export default function CirclesWyras({
    wyras,
    showEditWyraModal,
    setShowEditWyraModal,
    handleDeleteWyra,
    toggleFollow,
    blockWyra,
    fetchWyras
}: any) {
    const [user, setUser] = useState<User | null>(null);
    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

    const [selectedOptions, setSelectedOptions] = useState<{ [wyraId: number]: number | null }>({});
    const [isShowWhyReasonContainer, setIsShowWhyReasonContainer] = useState<{ [wyraId: number]: boolean }>({});
    const [isWhyReasonSet, setIsWhyReasonSet] = useState<{ [wyraId: number]: boolean }>({});
    const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
    const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});

    const supabase = createClient();

    // Group wyras by circle
    const wyrasByCircle = useMemo(() => {
        const grouped: Record<string, Wyra[]> = {};
        wyras.forEach((wyra: any) => {
            wyra.circles?.forEach((circle: any) => {
                if (!grouped[circle.id]) grouped[circle.id] = [];
                grouped[circle.id].push(wyra);
            });
        });
        return grouped;
    }, [wyras]);

    // Extract unique circles for tabs
    const circles = useMemo(() => {
        const map: Record<string, string> = {};
        wyras.forEach((wyra: any) => {
            wyra.circles?.forEach((circle: any) => {
                map[circle.id] = circle.name;
            });
        });
        return Object.entries(map).map(([id, name]) => ({ id, name }));
    }, [wyras]);

    useEffect(() => {
        if (circles.length && !selectedCircleId) {
            setSelectedCircleId(circles[0].id); // Default to first circle
        }
    }, [circles, selectedCircleId]);

    if (!wyras.length) {
        return <div className="text-center py-10">No Wyras yet.</div>;
    }

    return (
        <>
            {/* Circle Tabs */}
            {circles.length > 0 && (
                <div className="flex flex-wrap justify-center mt-2 gap-2 mb-6 border-b pb-2">
                    {circles.map(circle => (
                        <button
                            key={circle.id}
                            onClick={() => setSelectedCircleId(circle.id)}
                            className={`px-4 py-2 rounded-full font-medium transition ${selectedCircleId === circle.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            {circle.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="max-w-3xl space-y-6">
                {(wyrasByCircle[selectedCircleId!] ?? []).map((wyra: any) => (
                    <Card
                        key={wyra.id}
                        className="shadow-md hover:shadow-2xl border-0 bg-white/80 backdrop-blur-lg transition-all pt-4 animate-slide-in-right"
                    >
                        <CardContent>
                            {/* User Info */}
                            <div className="flex md:gap-2">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-12 h-12 relative rounded-full bg-gray-200">
                                        <img
                                            src={wyra.creator.avatar}
                                            alt="avatar"
                                            className="w-full h-full shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 border-gray-700 rounded-full object-cover"
                                        />
                                        <UserOnlineStatus userId={wyra.creator.id} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-black">
                                            {wyra.creator.firstname} {wyra.creator.lastname}
                                            <span>
                                                <span className="font-bold text-md mt-6"> Asked, </span>
                                                <small className="text-gray-500">
                                                    {relativeTime(wyra.created_at)}
                                                </small>
                                                {
                                                    wyra.is_edit &&
                                                    <small
                                                        className={`ml-2 px-1 py-1 rounded text-white font-semibold bg-blue-500`}
                                                    >
                                                        edited
                                                    </small>
                                                }
                                            </span>
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            @{wyra.creator.username}
                                        </p>
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
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
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setShowEditWyraModal({ isShow: true, id: wyra.id })
                                                        }
                                                        className="cursor-pointer hover:bg-gray-50"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Wyra
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteWyra(wyra.id)}
                                                        className="text-red-600 cursor-pointer hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete Wyra
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
                                                        <FollowButton
                                                            isFollowing={followStatus[wyra.created_by] ?? false}
                                                            loading={loadingStatus[wyra.created_by] ?? false}
                                                            toggleFollow={() => toggleFollow(wyra.created_by)}
                                                        />
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 cursor-pointer hover:bg-red-50"
                                                        onClick={() => blockWyra(wyra.created_by)}
                                                    >
                                                        <CircleOff className="w-4 h-4 mr-2" />
                                                        Block User
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

                            {/* Options */}
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
                                                    <span className="w-12 h-12 px-4 text-white rounded-full flex justify-center items-center text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-800">
                                                        OR
                                                    </span>
                                                )}

                                                <div
                                                    className={`my-3 relative overflow-hidden border shadow p-4 rounded-lg cursor-pointer w-full md:w-1/2 transition-all duration-300 transform hover:scale-[1.02]
                            ${isSelected
                                                            ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                                            : "hover:bg-gray-100"}
                            ${isDisabled ? "cursor-not-allowed opacity-70" : ""}
                          `}
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

                            <hr className="mt-4" />
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2 mt-5">
                                    <LikeButton wyraId={wyra.id} isFloatAllow={wyra.settings?.animate_floating_effects} userId={user?.id} />
                                    <DislikeButton wyraId={wyra.id} isFloatAllow={wyra.settings?.animate_floating_effects} userId={user?.id} />
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

            <Modal isOpen={showEditWyraModal.isShow} hideCloseButton>
                <ModalContent>
                    <ModalHeader className="flex justify-between items-center">
                        Edit Wyra
                        <button
                            onClick={() => setShowEditWyraModal({ isShow: false, id: "" })}
                            className="text-gray-600 hover:text-gray-900"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </ModalHeader>
                    <ModalBody>
                        <EditWyra
                            wyraId={showEditWyraModal.id}
                            fetchWyras={fetchWyras}
                            setShowEditWyraModal={setShowEditWyraModal}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
