"use client";

import { signOut } from "@/actions/auth";
import { useEffect, useState, Fragment } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bell,
  Search,
  Menu,
  Settings,
  UserPlus,
  Shield,
  HelpCircle,
  Info,
  FileText,
  Lock,
  Cookie,
  Users,
  AlertTriangle,
  Mail,
  LogOut,
  MessageCircle,
  Home,
} from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/actions/types";

interface HeaderProps {
  user: User;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export default function Header({ activeTab, onTabChange, user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notificationCount, setNotificationCount] = useState(12);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    await signOut();
  };

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

  const onHandlePageClick = (name: string) => {
    onTabChange(name);
    setIsDrawerOpen(false);
  };

  const menuItems = [
    { icon: Settings, label: "Account Settings", slug: "account-settings" },
    {
      icon: Bell,
      label: "Notification Settings",
      slug: "notification-settings",
    },
    { icon: UserPlus, label: "Invite", slug: "invite" },
    { icon: Shield, label: "Block/Unblock", slug: "block-unblock" },
    { icon: HelpCircle, label: "Help/FAQs", slug: "help-faqs" },
    { icon: Info, label: "About Us", slug: "about-us" },
    { icon: FileText, label: "Terms & Conditions", slug: "terms" },
    { icon: Lock, label: "Privacy & Data Policy", slug: "privacy" },
    { icon: Cookie, label: "Cookies Policy", slug: "cookies" },
    { icon: Users, label: "Community Guidelines", slug: "community" },
    { icon: AlertTriangle, label: "CSAE Policy", slug: "csae" },
    { icon: Mail, label: "Contact Us", slug: "contact" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Hamburger Menu */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </button>

          <Transition show={isDrawerOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-50"
              onClose={setIsDrawerOpen}
            >
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/30" />
              </Transition.Child>

              <div className="fixed inset-0 flex z-50">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="relative w-80 max-w-full bg-white h-full shadow-xl overflow-y-auto">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center p-6 border-b border-gray-200">
                        <Link
                          href="/"
                          onClick={() => onHandlePageClick("home")}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="-5 -5 34 34"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-8 h-8 text-white"
                              >
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                              </svg>
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Wyra
                            </h2>
                          </div>
                        </Link>
                      </div>
                      {/* User Info */}
                      <div
                        className="p-6 border-b border-gray-200 flex items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => onHandlePageClick("profile")}
                      >
                        {userProfile?.avatar ? (
                          <img
                            src={userProfile.avatar}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-lg font-semibold text-gray-600">
                              {userProfile?.firstname?.[0]?.toUpperCase() ||
                                userProfile?.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {userProfile?.firstname} {userProfile?.lastname}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{userProfile?.username}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => onHandlePageClick(item.slug)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                              activeTab === item.slug
                                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <item.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ))}
                      </nav>

                      {/* Logout */}
                      <div className="border-t border-gray-200 p-4">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          <span className="font-medium">Log Out</span>
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>

          {/* Center - Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="max-w-md mx-auto flex items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="-2 -2 28 28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-heart w-8 h-8 text-white"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-montserrat">
                  Wyra
                </h2>
              </div>
            </Link>
          </div>

          {/* Right - Search, Home, Chat, and Notifications */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users or Wyras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <button
              onClick={() => onTabChange("home")}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="sr-only">Home</span>
            </button>
            <button
              onClick={() => onTabChange("chat")}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="sr-only">Chat</span>
            </button>
            <button
              onClick={() => onTabChange("notifications")}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
