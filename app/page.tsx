"use client";

import CircleList from "@/components/circle/CircleList";
import { createClient } from "@/utils/supabase/client";
import WyraTimeLine from "@/components/wyra/TimeLine";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Settings from "@/components/account/Settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import BottomNavigation from "@/components/bottom-navigation"
import Loader from "@/components/common/loader";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState("home")
  const [notifications, setNotifications] = useState(0)

  const [activePage, setActivePage] = useState("");

  const handlePageClick = (slug : string) => {
    setActivePage(slug);
    console.log('slug');
    console.log(slug);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    // Simulate notifications
    setNotifications(3)

  }, []);
  const handleChatClick = () => {
    setActiveTab("chat")
  }

  const handleHomeClick = () => {
    setActiveTab("home")
  }

  const renderCurrentPage = () => {
    switch (activePage) {
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
        return <WyraTimeLine />;

    }

  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return 'WyraFeed';
      case "favorites":
        return 'FavoritesPage';
      case "create":
        return 'CreateWyra';
      case "chat":
        return 'ChatPage';
      case "profile":
        return 'UserProfile';
      default:
        return 'WyraFeed';
    }
  }

  if (!user) return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center"><Loader width={20} height={20} color="border-gray-700"/></div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header
        user={user}
        notificationCount={notifications}
        onNotificationClick={() => console.log("Notifications clicked")}
        onChatClick={handleChatClick}
        onHomeClick={handleHomeClick}
        onPageClick={handlePageClick}
        activePage={activePage}
      />

      <main className="pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4">

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
            {/* <CardHeader className="text-center pb-6"> */}
              {/* <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle> */}
              {/* <CardDescription className="text-gray-600 text-lg">Sign in to start making choices</CardDescription> */}
            {/* </CardHeader> */}
            <CardContent>
              { renderCurrentPage() }
            </CardContent>
          </Card>

        </div>
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userProfilePicture={user.user_metadata?.profile_picture_url}
      />
    </div>
  )
}

interface HomePageProps {
  user: User
}