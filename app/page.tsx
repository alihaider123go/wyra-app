"use client";

import { createClient } from "@/utils/supabase/client";
import WyraTimeLine from "@/components/wyra/TimeLine";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Settings from "@/components/account/Settings";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import Chat from "@/components/chat";

import Loader from "@/components/common/loader";
import Profile from "@/components/profile";
import CreateWyra from "@/components/wyra/CreateWyra";
import AboutUs from "@/components/about-us";
import ContactUs from "@/components/contact-us";
import Cookies from "@/components/policies/cookies";
import TermsOfService from "@/components/tos";
import PrivacyPolicy from "@/components/policies/privacy";
import CommunityGuidelines from "@/components/community";
import CSAEPolicy from "@/components/policies/csae";
import HelpCenter from "@/components/help";
import InviteFriends from "@/components/invite";
import AccountPrivacySettings from "@/components/account-privacy";
import NotificationsSettings from "@/components/notifications/setting";
import BlockUserInfo from "@/components/blockuser";
import { useSessionUser } from "@/utils/useSessionUser";

export default function Home() {
  const supabase = createClient();
  const { user: sessionUser, loading, isVerified , isProfileCompleted,refetch } = useSessionUser();

  // const [user, setUser] = useState<User | null>(null);
 useEffect(() => {
  if (!loading) {
    if (!isProfileCompleted) {
      handleTabClick("profile-settings");
    }
  }
}, [loading, isProfileCompleted]);


  const [activeTab, setActiveTab] = useState("home");
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const {
  //       data: { user },
  //       error: authError,
  //     } = await supabase.auth.getUser();

  //     if (authError || !user) {
  //       console.error("Auth error:", authError);
  //       return;
  //     }
  //     setUser(user);
  //   };

  //   fetchUser();
  // }, []);



  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case "home":
        return <WyraTimeLine />;
      case "create":
        return <CreateWyra onTabChange={handleTabClick}/>;
      case "chat":
        return <Chat userId={sessionUser?.id} />;
      case "profile":
        return <Profile userId={sessionUser?.id} />;
      case "profile-settings":
        return <Settings user={sessionUser} isVerified={isVerified} refetch={refetch}/>;
      case "account-settings":
        return <AccountPrivacySettings />;
      case "notification-settings":
        return <NotificationsSettings />;
      case "invite":
        return <InviteFriends />;
      case "block-unblock":
        return <BlockUserInfo />;
      case "help-faqs":
        return <HelpCenter />;
      case "about-us":
        return <AboutUs />;
      case "contact":
        return <ContactUs />;
      case "terms":
        return <TermsOfService />;
      case "privacy":
        return <PrivacyPolicy />;
      case "cookies":
        return <Cookies />;
      case "community":
        return <CommunityGuidelines />;
      case "csae":
        return <CSAEPolicy />;
      default:
        return null;
    }
  };

  if (!loading && !sessionUser)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <Loader width={20} height={20} color="border-gray-700" />
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header
        isVerified={isVerified}
        user={sessionUser}
        onTabChange={handleTabClick}
        activeTab={activeTab}
        isProfileCompleted={isProfileCompleted}
      />

      <main className="pb-20 md:pb-4">
        <div className="md:max-w-4xl max-w-2xl mx-auto p-4">{renderCurrentTab()}</div>
      </main>

      <BottomNavigation
        isVerified={isVerified}
        activeTab={activeTab}
        onTabChange={handleTabClick}
        user={sessionUser}
        isProfileCompleted={isProfileCompleted}

      />
    </div>
  );
}
