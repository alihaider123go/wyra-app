"use client";

import React from "react";
import { formatNumber } from "@/utils/helper"; // Assuming you have a utility function for formatting numbers
import { Button } from "@/components/ui/button"

import { Trash2,
UserCog,
Settings,
ExternalLink,
Settings2

 } from "lucide-react"

interface UserProfileHeaderProps {
  user: {
    avatar?: string;
    fullName: string;
    username: string;
    bio?: string;
    stats: {
      wyras: number;
      followers: number;
      following: number;
    };
  };
  onEditProfile: () => void;
  onShareProfile: () => void;
}

export default function UserProfileHeader({
  user,
  onEditProfile,
  onShareProfile,
}: UserProfileHeaderProps) {
  return (
    <>
      {/* Left: Avatar & Info */}
      <div className="flex items-start sm:items-center gap-4 w-full">
        {/* Avatar */}
        <div className="md:w-32 md:h-32 w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded-full object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Avatar
            </div>
          )}
        </div>

        {/* Name, username, bio */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-black">{user.fullName}</h2>
          <p className="text-gray-600 text-sm">@{user.username}</p>
          {/* {user.bio && <p className="text-gray-800 text-sm mt-1">{user.bio}</p>} */}

          <div className="mt-2 flex justify-between sm:justify-start gap-6 text-center sm:text-left text-sm font-medium text-black">
            <div>
              <div className="text-3xl">{formatNumber(user.stats.wyras)}</div>
              <div className="text-gray-500">Wyras</div>
            </div>
            <div>
              <div className="text-3xl">{formatNumber(user.stats.followers)}</div>
              <div className="text-gray-500">Followers</div>
            </div>
            <div>
              <div className="text-3xl">{formatNumber(user.stats.following)}</div>
              <div className="text-gray-500">Following</div>
            </div>
          </div>
        <div className="flex flex-row gap-2 mt-2 sm:mt-2">
          <Button
            onClick={onEditProfile}
            className="md:w-[40%] w-[60%] px-4 py-2 text-md font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 rounded hover:bg-blue-50"
          >
            <Settings className="w-12 h-12 mr-2" />
            Edit Profile
          </Button>
          <Button
            onClick={onShareProfile}
            className="px-4 py-2 text-md text-black font-medium bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-400 hover:to-gray-500 border-gray-700 rounded hover:bg-blue-50"
          >
            <ExternalLink className="w-12 h-12"/>
            {/* Share Profile */}
          </Button>
        </div>

        </div>

      </div>

    </>
  );
}
