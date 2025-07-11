import { UserRoundCheck, UserRoundPlus } from "lucide-react";

interface FollowButtonProps {
  isFollowing: boolean;
  loading: boolean;
  toggleFollow: () => void;
}

export default function FollowButton({
  isFollowing,
  loading,
  toggleFollow,
}: FollowButtonProps) {
  return (
    <div
      onClick={toggleFollow}
      className="flex w-full text-sm text-gray-700 cursor-pointer"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2" />
          Loading...
        </>
      ) : isFollowing ? (
        <>
          <UserRoundCheck className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserRoundPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </div>
  );
}
