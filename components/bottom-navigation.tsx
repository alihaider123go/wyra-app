"use client";

import { Home, Heart, Plus, MessageCircle, User } from "lucide-react";
import { ExtendedUser, UserProfile } from "@/actions/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: ExtendedUser|null;
  isVerified: boolean;
  isProfileCompleted:boolean;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  user,
  isVerified,
  isProfileCompleted
}: BottomNavigationProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    if(user){
      setUserProfile(user?.user_profile || null);
    }
  }, [user]);
  const tabs = [
    { id: "home", icon: Home, label: "Home", disable: !isVerified && !isProfileCompleted },
    { id: "favorites", icon: Heart, label: "Favorites", disable: !isVerified && !isProfileCompleted },
    { id: "create", icon: Plus, label: "Create", disable: !isVerified && !isProfileCompleted },
    { id: "chat", icon: MessageCircle, label: "Chat", disable: !isVerified && !isProfileCompleted },
    { id: "profile", icon: User, label: "Profile", disable: !isVerified && !isProfileCompleted },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 md:hidden shadow-2xl">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              disabled={tab.disable}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 rounded-2xl transition-all duration-300 transform
    ${
      tab.disable
        ? "text-gray-400 cursor-not-allowed bg-gray-100"
        : isActive
        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
    }`}
            >
              {tab.id === "profile" && userProfile?.avatar ? (
                <div
                  className={`w-6 h-6 rounded-full overflow-hidden ${
                    isActive ? "ring-2 ring-white" : ""
                  } ${tab.disable ? "opacity-50" : ""}`}
                >
                  <img
                    src={userProfile?.avatar || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : tab.id === "create" ? (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tab.disable
                      ? "bg-gray-300 text-gray-400"
                      : isActive
                      ? "bg-white/20"
                      : "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "animate-bounce-slow" : ""
                  } ${tab.disable ? "text-gray-400" : ""}`}
                />
              )}

              <span
                className={`text-xs mt-1 font-semibold ${
                  isActive ? tab.disable ? "text-gray-400" : "text-white" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
