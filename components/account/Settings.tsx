"use client";

import React, { useState } from "react";
import type { User } from "@supabase/supabase-js";
import ProfileUpdateCard from "./ProfileUpdateCard";

interface SettingsProps {
  user: User | null;
}

export default function Settings({ user }: SettingsProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
        <ProfileUpdateCard userId={user?.id} />
        {/*
        <ResetPasswordCard />
        <DeleteAccountCard userId={userId} onLogout={onLogout} /> */}
      </div>
    </div>
  );
}