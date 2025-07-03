"use client";

import React from "react";
import { formatNumber } from "@/utils/helper"; // Assuming you have a utility function for formatting numbers
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
    <div className="bg-white border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
      {/* Left: Avatar & Info */}
      <div className="flex items-start sm:items-center gap-4 w-full">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
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
          {user.bio && (
            <p className="text-gray-800 text-sm mt-1">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Right: Stats + Actions */}
      <div className="w-full sm:w-auto flex flex-col gap-3">
        <div className="flex justify-between sm:justify-start gap-6 text-center sm:text-left text-sm font-medium text-black">
          <div>
            <div>{formatNumber(user.stats.wyras)}</div>
            <div className="text-gray-500">Wyras</div>
          </div>
          <div>
            <div>{formatNumber(user.stats.followers)}</div>
            <div className="text-gray-500">Followers</div>
          </div>
          <div>
            <div>{formatNumber(user.stats.following)}</div>
            <div className="text-gray-500">Following</div>
          </div>
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={onEditProfile}
            className="px-4 py-2 text-sm font-medium border border-blue-700 text-blue-700 rounded hover:bg-blue-50"
          >
            Edit Profile
          </button>
          <button
            onClick={onShareProfile}
            className="px-4 py-2 text-sm font-medium border border-blue-700 text-blue-700 rounded hover:bg-blue-50"
          >
            Share Profile
          </button>
        </div>
      </div>
    </div>
  );
}
