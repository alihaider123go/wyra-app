"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // your supabase client import path

interface ProfileInformationProps {
  userId: string|undefined;
}

interface ProfileData {
  firstname: string;
  lastname: string;
  dob: string; // yyyy-mm-dd format
  username: string;
  bio: string;
  avatar_url: string;
}

export default function ProfileInformation({ userId }: ProfileInformationProps) {
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    dob: "",
    username: "",
    bio: "",
    avatar_url: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;

        setProfile({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          dob: data.dob ? data.dob.slice(0, 10) : "",
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      } catch (error: any) {
        setErrorMsg(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchProfile();
    }
  }, [userId, supabase]);

  async function uploadAvatar(file: File) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let avatar_url = profile.avatar_url;

      if (avatarFile) {
        avatar_url = await uploadAvatar(avatarFile);
      }

      const updates = {
        firstname: profile.firstname,
        lastname: profile.lastname,
        dob: profile.dob,
        username: profile.username,
        bio: profile.bio,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;

      setSuccessMsg("Profile updated successfully!");
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-5">
      {errorMsg && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="text-green-600 bg-green-100 p-2 rounded">{successMsg}</div>
      )}

      <div>
        <label className="block font-semibold mb-1">First Name</label>
        <input
          type="text"
          value={profile.firstname}
          onChange={(e) =>
            setProfile((p) => ({ ...p, firstname: e.target.value }))
          }
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Last Name</label>
        <input
          type="text"
          value={profile.lastname}
          onChange={(e) =>
            setProfile((p) => ({ ...p, lastname: e.target.value }))
          }
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Date of Birth</label>
        <input
          type="date"
          value={profile.dob}
          onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Username</label>
        <input
          type="text"
          value={profile.username}
          onChange={(e) =>
            setProfile((p) => ({ ...p, username: e.target.value.trim() }))
          }
          className="border p-2 rounded w-full"
          required
          minLength={3}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Bio</label>
        <textarea
          rows={4}
          value={profile.bio}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          className="border p-2 rounded w-full"
          placeholder="Write something about yourself"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Avatar</label>
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="avatar preview"
            className="w-24 h-24 rounded-full mb-2 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
      </div>

      <button
        type="submit"
        disabled={updating}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {updating ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}
