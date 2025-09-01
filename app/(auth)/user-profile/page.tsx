"use client";

import UserProfile from "@/components/profile/userProfile";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import Header from "@/components/header";
import { useSessionUser } from "@/utils/useSessionUser";

export default function UserProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const { user: sessionUser, loading, isVerified, isProfileCompleted, refetch } = useSessionUser();

  return (
    <>
        {/* <Header
              isVerified={isVerified}
              user={sessionUser}
              onTabChange={handleTabClick}
              activeTab={activeTab}
              isProfileCompleted={isProfileCompleted}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            /> */}
    
      <div className="md:max-w-4xl max-w-2xl mx-auto p-4">
        <UserProfile userId={userId} />
      </div>
      </>
    
  );
}
