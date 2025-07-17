"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { uploadFiles } from "@/actions/common";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Heart, Sparkles, Zap, Users } from "lucide-react";

interface ProfileInformationProps {
  userId: string;
  refetch?: any;
}

interface ProfileData {
  firstname: string;
  lastname: string;
  dob: string;
  username: string;
  bio: string;
  avatar: string;
  gender: string;
  email: string;
}

export default function ProfileInformation({
  userId,
  refetch,
}: ProfileInformationProps) {
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData>({
    firstname: "",
    lastname: "",
    dob: "",
    username: "",
    bio: "",
    gender: "",
    email: "",
    avatar: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalUsername, setOriginalUsername] = useState(""); // Track original username
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  const today = new Date();
  const minAgeDate = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  // Fetch user profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
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
          avatar: data.avatar || "",
          email: data.email || "",
          gender: data.gender || "",
        });

        setOriginalUsername(data.username || "");
      } catch (error: any) {
        setErrorMsg(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchProfile();
  }, [userId]);

  // Real-time username availability check (only if changed)
  useEffect(() => {
    if (
      !profile.username ||
      profile.username.length < 3 ||
      profile.username === originalUsername
    ) {
      setUsernameAvailable(null);
      return;
    }

    const delay = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("username", profile.username)
          .neq("id", userId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Username check error", error);
          setUsernameAvailable(null);
        } else {
          setUsernameAvailable(!data);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [profile.username, originalUsername, userId]);

  // Submit profile update
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (usernameAvailable === false) {
      setErrorMsg("Username is already taken. Please choose another.");
      setUpdating(false);
      return;
    }

    try {
      let avatar = profile.avatar;

      if (avatarFile) {
        const uploaded = await uploadFiles(
          [avatarFile],
          userId,
          "profile-avatars"
        );
        if (uploaded.length === 0) {
          alert("Failed to upload profile image");
          return;
        }
        avatar = uploaded[0].publicUrl;
      }

      const updates = {
        firstname: profile.firstname,
        lastname: profile.lastname,
        dob: profile.dob,
        username: profile.username,
        bio: profile.bio,
        avatar,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId)
        .select();

      if (error) throw error;

      setSuccessMsg("Profile updated successfully!");
      refetch();
      setOriginalUsername(profile.username); // reset original
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

 const handleSetProfilePicture = (e: any) => {
  const file = e.target.files?.[0];

  if (file) {
    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setProfile((prev) => ({
      ...prev,
      avatar: previewUrl, // store preview URL instead of file object
    }));
  }
};

  if (loading) return <div>Loading profile...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
      {errorMsg && (
        <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
          <AlertDescription className="text-red-700">
            {errorMsg}
          </AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm">
          <AlertDescription className="text-green-700">
            {successMsg}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1">Profile Picture</label>
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt="avatar preview"
              className="shadow-2xl p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-gray-700 w-24 h-24 rounded-full mb-2 object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleSetProfilePicture(e)}
          />
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          className="h-12 w-full mx-[-50px] my-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Upload Profile Picture
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="firstname"
            className="text-sm font-semibold text-gray-700"
          >
            {" "}
            First Name{" "}
          </Label>
          <Input
            type="text"
            placeholder="First Name"
            id="firstname"
            value={profile.firstname}
            onChange={(e) =>
              setProfile((p) => ({ ...p, firstname: e.target.value }))
            }
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="lastname"
            className="text-sm font-semibold text-gray-700"
          >
            {" "}
            Last Name{" "}
          </Label>
          <Input
            type="text"
            placeholder="Last Name"
            id="lastname"
            value={profile.lastname}
            onChange={(e) =>
              setProfile((p) => ({ ...p, lastname: e.target.value }))
            }
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="username"
            className="text-sm font-semibold text-gray-700"
          >
            {" "}
            Username{" "}
          </Label>
          <Input
            type="text"
            placeholder="Username"
            id="username"
            value={profile.username}
            onChange={(e) =>
              setProfile((p) => ({ ...p, username: e.target.value }))
            }
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
            minLength={3}
            required
          />
          <div className="text-sm mt-1">
            {profile.username !== originalUsername && (
              <>
                {checkingUsername && (
                  <span className="text-gray-500">
                    Checking availability...
                  </span>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-green-600">
                    Username is available ✓
                  </span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-red-600">Username is taken ✗</span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">
            {" "}
            Date of Birth{" "}
          </Label>
          <Input
            type="date"
            placeholder="Date of Birth"
            id="dob"
            value={profile.dob}
            onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="gender"
            className="text-sm font-semibold text-gray-700"
          >
            Gender
          </Label>
          <div className="relative w-full">
            <select
              id="gender"
              name="gender"
              required
              value={profile.gender}
              onChange={(e) =>
                setProfile((p) => ({ ...p, gender: e.target.value }))
              }
              className={`w-full h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none rounded-xl bg-white/90 backdrop-blur-sm px-4 pr-10 appearance-none 
                          ${
                            profile.gender === ""
                              ? "text-gray-400"
                              : "text-gray-900"
                          }`}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>

            {/* Custom Dropdown Icon */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="Email"
            className="h-14 text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
          {" "}
          Bio{" "}
        </Label>
        <Textarea
          placeholder="Write something about yourself"
          id="bio"
          rows={4}
          maxLength={200}
          value={profile.bio}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          className="text-base placeholder:text-gray-400 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90 backdrop-blur-sm"
          required
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {profile.bio.length}/200 characters
        </div>
      </div>

      {/* <div>
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
        <div className="text-sm mt-1">
          {profile.username !== originalUsername && (
            <>
              {checkingUsername && (
                <span className="text-gray-500">Checking availability...</span>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <span className="text-green-600">Username is available ✓</span>
              )}
              {!checkingUsername && usernameAvailable === false && (
                <span className="text-red-600">Username is taken ✗</span>
              )}
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Bio</label>
        <textarea
          rows={4}
          maxLength={200}
          value={profile.bio}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          className="border p-2 rounded w-full"
          placeholder="Write something about yourself"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {profile.bio.length}/200 characters
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Avatar</label>
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt="avatar preview"
            className="w-24 h-24 rounded-full mb-2 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
      </div> */}

      <Button
        type="submit"
        disabled={updating}
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {updating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Updating ...
          </>
        ) : (
          "Update Profile"
        )}
      </Button>
      {/* <button
        type="submit"
        disabled={updating}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {updating ? "Saving..." : "Update Profile"}
      </button> */}
    </form>
  );
}
