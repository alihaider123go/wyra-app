import { getUserAvatar } from "@/actions/common";
import { useEffect, useState } from "react";

export default function CustomAvatar({
  userId,
  firstName = "",
  lastName = "",
}: {
  userId: string;
  firstName?: string;
  lastName?: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userId) {
        const tempImg = await getUserAvatar(userId);
        setAvatarUrl(tempImg || "");
      }
    };
    fetchAvatar();
  }, [userId]);

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  if (avatarUrl) {
    // Avatar with gradient background
    return (
      <div
        className="w-full h-full rounded-full
                   bg-gradient-to-r from-blue-500 to-purple-600
                   flex items-center justify-center p-1"
      >
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    );
  }

  // Gravatar-style fallback with gradient border + white background
  return (
    <div
      className="relative w-full h-full rounded-full p-[2px]
                 bg-gradient-to-r from-blue-500 to-purple-600"
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center
                   bg-white text-gray-700 font-bold text-lg"
      >
        {initials || "?"}
      </div>
    </div>
  );
}
