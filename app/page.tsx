"use client";

import { createClient } from "@/utils/supabase/client";
import WyraTimeLine from "@/components/wyra/TimeLine";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Settings from "@/components/account/Settings";
import Chat from "@/components/chat";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import Loader from "@/components/common/loader";
import Profile from "@/components/profile";
import CreateWyra from "@/components/wyra/CreateWyra";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        return;
      }
      setUser(user);
    };

    fetchUser();
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const renderCurrentTab = () => {

    switch (activeTab) {
      case "home":
        return <WyraTimeLine />;
      case "create":
        return <CreateWyra />; 
      case "chat":
        return <Chat userId={user?.id} />;
      case "profile":
        return <Profile userId={user?.id} />;
      case "account-settings":
        return <Settings user={user} />;
      case "notification-settings":
        return "notification-settings";
      case "invite":
        return "invite";
      case "block-unblock":
        return "block-unblock";
      case "help-faqs":
        return "help-faqs";
      case "about-us":
        return "about-us";
      case "terms":
        return "terms";
      case "privacy":
        return "privacy";
      case "cookies":
        return "cookies";
      case "community":
        return "community";
      case "csae":
        return "csae";
      default:
        return null;
    }
  };

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <Loader width={20} height={20} color="border-gray-700" />
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header user={user} onTabChange={handleTabClick} activeTab={activeTab} />

      <main className="pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            <CardContent>{renderCurrentTab()}</CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabClick}
        user={user}
      />
    </div>
  );
}
