"use client";

import { createClient } from "@/utils/supabase/client";
import WyraTimeLine from "@/components/wyra/TimeLine";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Settings from "@/components/account/Settings";
import Header from "@/components/header"
import BottomNavigation from "@/components/bottom-navigation"
import Chat from "@/components/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Notification Settings</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "invite":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">invite</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "block-unblock":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">block unblock</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "help-faqs":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Faqs</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "about-us":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">About Us</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "terms":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Terms</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "privacy":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Privacy</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "cookies":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Cookies</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "community":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Community</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
      case "case":
        return <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> <CardHeader className="text-center pb-6"> <CardTitle className="text-2xl font-bold text-gray-800">Case</CardTitle> </CardHeader> <CardContent className="text-center"> COMING SOON </CardContent> </Card>;
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
          {/* <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right"> */}
            {/* <CardContent> */}
              {renderCurrentTab()}
              {/* </CardContent> */}
          {/* </Card> */}
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
