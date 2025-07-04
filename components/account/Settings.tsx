"use client";

import React, { useState } from "react";
import type { User } from "@supabase/supabase-js";
import ProfileUpdateCard from "./ProfileUpdateCard";
import ResetPasswordForm from "@/components/account/ResetPasswordForm";
import DeleteAccountButton from "@/components/account/DeleteAccountButton";




import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SettingsProps {
  user: User | null;
}

export default function Settings({ user }: SettingsProps) {
  return (
    <>
      {/* Personal Information Card */}
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
              <ProfileUpdateCard userId={user?.id} />
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card className="mt-[50px] shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
              <ResetPasswordForm />
        </CardContent>
      </Card>

      {/* Delete account card */}
      <Card className="mt-[50px] shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-slide-in-right">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl text-left font-bold text-red-600">Danger Zone</CardTitle>
          <CardTitle className="text-2xl text-center font-bold text-gray-800">Delete Account</CardTitle>
          <CardDescription className="text-gray-600 text-lg">Once you delete your account, there is no going back. Please be certain.</CardDescription>
        </CardHeader>
        <CardContent>
              <DeleteAccountButton/>
        </CardContent>
      </Card>

    </>

  );
}