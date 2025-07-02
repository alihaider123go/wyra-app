"use client";

import React, { useEffect, useState } from "react";
import { getMyWyras } from "@/actions/wyra"; // path to your function
import { createClient } from "@/utils/supabase/client"; // your supabase client
import Link from "next/link";
import LikeButton from "./LikeBtn";
import { User } from "@supabase/supabase-js";
import DislikeButton from "./DislikeBtn";
import CommentButton from "./CommentBtn";
import FollowButton from "./FollowUnFollowBtn";

interface WyraMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
}

interface WyraOption {
  id: string;
  option_text: string;
  position: number;
  wyra_media: WyraMedia[];
}

interface Wyra {
  id: string;
  title?: string;
  created_at: string;
  created_by: string;
  wyra_option: WyraOption[];
}
export default function MyWyraTimeline() {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  useEffect(() => {
    async function fetchWyras() {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      } else {
        setUser(user);
      }

      try {
        const result = await getMyWyras(user.id); // call query function
        setWyraList(result || []);
      } catch (err) {
        console.error("Failed to fetch wyras", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWyras();
  }, []);

  if (loading) return <div className="text-center py-10">Loading Wyras...</div>;
  if (!wyraList.length)
    return <div className="text-center py-10">No Wyras yet.</div>;

  return (
    <>
      <Link href="/create-wyra">
        <div className="bg-gray-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-gray-700 transition">
          Create Wyra
        </div>
      </Link>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {wyraList.map((wyra) => (
          <div key={wyra.id} className="bg-white border rounded-xl shadow p-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-black">
                Would you rather...
              </h2>
              {user?.id && wyra?.created_by && (
                <FollowButton
                  currentUserId={user?.id}
                  profileUserId={wyra.created_by}
                />
              )} 
            </div>
            {wyra.wyra_option
              .sort((a, b) => a.position - b.position)
              .map((opt: any, index: number) => (
                <div key={opt.id} className="mb-4">
                  <p className="text-gray-800 font-medium mb-1">
                    Option {index + 1}: {opt.option_text}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {opt.wyra_media.map((media: any) => (
                      <div key={media.id} className="w-32">
                        {media.media_type === "image" ? (
                          <img
                            src={media.media_url}
                            alt="Option media"
                            className="rounded-md object-cover max-h-28 w-full"
                          />
                        ) : (
                          <video
                            src={media.media_url}
                            controls
                            className="rounded-md max-h-28 w-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            <div className="flex items-center gap-2">
              <LikeButton wyraId={wyra.id} userId={user?.id} />

              <DislikeButton wyraId={wyra.id} userId={user?.id} />

              <CommentButton wyraId={wyra.id} userId={user?.id} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
