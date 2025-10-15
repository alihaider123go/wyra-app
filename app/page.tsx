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
import FavoritesWyra from "@/components/wyra/FavoritesWyra";
import NotificationsList from "@/components/notifications/notificationList";
import { NotificationsProvider } from "@/components/notifications/useNotifications";
import { isNotificationAllowed, isSettingAllowed } from "@/utils/helper";
import { checkUserOnlineStatus, updateLastSeen } from "@/actions/common";
import '@ant-design/v5-patch-for-react-19';
import UserProfile from "@/components/profile/userProfile";

export default function Home() {
  const supabase = createClient();
  const { user: sessionUser, loading, isVerified, isProfileCompleted, refetch } = useSessionUser();
  const [themeLoaded, setThemeLoaded] = useState(false);



 useEffect(() => {
  const checkDarkMode = async () => {
    if (!sessionUser?.id) {
      setThemeLoaded(true);
      return;
    }

    const isDarkMode = await isSettingAllowed(sessionUser?.id, "dark_mode");

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setThemeLoaded(true);
  };

  checkDarkMode();
}, [sessionUser]);

  // const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!loading) {
      if (!isProfileCompleted) {
        handleTabClick("profile-settings");
      }
    }
  }, [loading, isProfileCompleted]);


  const [activeTab, setActiveTab] = useState("home");
  const [postId, setPostId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
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

  useEffect(() => {
    if (!sessionUser?.id) return;

    const interval = setInterval(() => {
      updateLastSeen(sessionUser?.id);
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [sessionUser?.id]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setSearchTerm("")
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case "home":
        return <WyraTimeLine searchTerm={searchTerm} setActiveTab={setActiveTab} setSelectedUserId={setSelectedUserId} setPostId={setPostId} postId={postId} />;
      case "create":
        return <CreateWyra onTabChange={handleTabClick} />;
      case "chat":
        return <Chat userId={sessionUser?.id} />;
      case "profile":
        return <Profile userId={sessionUser?.id} setActiveTab={setActiveTab} setSelectedUserId={setSelectedUserId} />;
      case "user-profile":
        return <UserProfile userId={selectedUserId} setActiveTab={setActiveTab} setSelectedUserId={setSelectedUserId}/>;
      case "profile-settings":
        return <Settings user={sessionUser} isVerified={isVerified} refetch={refetch} />;
      case "account-settings":
        return <AccountPrivacySettings userId={sessionUser?.id} />;
      case "notification-settings":
        return <NotificationsSettings userId={sessionUser?.id} />;
      case "notifications":
        return <NotificationsList userId={sessionUser?.id} setActiveTab={setActiveTab} setPostId={setPostId} />;
      case "invite":
        return <InviteFriends />;
      case "block-unblock":
        return <BlockUserInfo setActiveTab={setActiveTab} setSelectedUserId={setSelectedUserId} />;
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
      case "favorites":
        return <FavoritesWyra searchTerm={searchTerm} setActiveTab={setActiveTab} setSelectedUserId={setSelectedUserId} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (postId) {
      setTimeout(() => {
        setPostId("")
      }, 5000);
    }
  }, [postId])

   if (!themeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader width={20} height={20} color="border-gray-700" />
      </div>
    );
  }

  if (!loading && !sessionUser)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <Loader width={20} height={20} color="border-gray-700" />
      </div>
    );
  return (
    <NotificationsProvider userId={sessionUser?.id}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header
          isVerified={isVerified}
          user={sessionUser}
          onTabChange={handleTabClick}
          activeTab={activeTab}
          isProfileCompleted={isProfileCompleted}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setActiveTab={setActiveTab}
          setPostId={setPostId}
          setSelectedUserId={setSelectedUserId}
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
    </NotificationsProvider>
  );
}
