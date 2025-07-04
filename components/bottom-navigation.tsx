"use client"

import { Home, Heart, Plus, MessageCircle, User } from "lucide-react"
import { UserProfile } from "@/actions/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User as UserType } from "@supabase/supabase-js";

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  user: UserType;
}

export default function BottomNavigation({ activeTab, onTabChange, user }: BottomNavigationProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return;
      }

      setUserProfile(profile);
    };
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "favorites", icon: Heart, label: "Favorites" },
    { id: "create", icon: Plus, label: "Create" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 md:hidden shadow-2xl">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 rounded-2xl transition-all duration-300 transform ${
                isActive
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              {tab.id === "profile" && userProfile?.avatar ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden ${isActive ? "ring-2 ring-white" : ""}`}>
                  <img
                    src={userProfile?.avatar || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : tab.id === "create" ? (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? "bg-white/20" : "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className={`w-6 h-6 ${isActive ? "animate-bounce-slow" : ""}`} />
              )}
              <span className={`text-xs mt-1 font-semibold ${isActive ? "text-white" : ""}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
