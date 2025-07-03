"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, relativeTime } from "@/utils/helper";

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

interface MyWyrasProps {
  userId: string | null;
}

export default function MyWyras({ userId }: MyWyrasProps) {
  const [wyraList, setWyraList] = useState<Wyra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchWyras() {
      setLoading(true);
      const supabase = createClient();

      // Query wyras where created_by = userId, including options and media
      const { data, error } = await supabase
        .from("wyra")
        .select(
          `
          id,
          title,
          created_at,
          created_by,
          wyra_option (
            id,
            option_text,
            position,
            wyra_media (
              id,
              media_url,
              media_type
            )
          )
        `
        )
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching wyras:", error.message);
        setWyraList([]);
      } else {
        setWyraList(data || []);
      }
      setLoading(false);
    }

    fetchWyras();
  }, [userId]);

  if (loading) return <div className="text-center py-10">Loading Wyras...</div>;

  if (wyraList.length === 0)
    return <div className="text-center py-10">No Wyras yet.</div>;

  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Wyras</h2>
        <Link href="/create-wyra" passHref>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
            <Plus size={18} /> Create Wyra
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading Wyras...</div>
      ) : wyraList.length === 0 ? (
        <div className="text-center py-10">No Wyras yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {wyraList.map((wyra) => (
            <div
              key={wyra.id}
              className="border rounded-xl p-4 shadow hover:shadow-md transition relative bg-white flex flex-col gap-4"
            >
              <p className="text-sm text-gray-500">
                {formatDate(wyra.created_at)} • {relativeTime(wyra.created_at)}
              </p>

              {/* Options Row */}
              <div className="flex items-center justify-between gap-4">
                {/* Option 1 */}
                <div className="flex-1 border rounded-lg p-3 bg-gray-50 flex flex-col items-center gap-2">
                  <p className="font-medium text-center">
                    {wyra.wyra_option[0]?.option_text}
                  </p>
                  {wyra.wyra_option[0]?.wyra_media?.[0] &&
                    (wyra.wyra_option[0].wyra_media[0].media_type ===
                    "image" ? (
                      <img
                        src={wyra.wyra_option[0].wyra_media[0].media_url}
                        alt="Option 1 Media"
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <video
                        src={wyra.wyra_option[0].wyra_media[0].media_url}
                        controls
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                </div>

                {/* OR */}
                <div className="text-gray-500 font-bold">OR</div>

                {/* Option 2 */}
                <div className="flex-1 border rounded-lg p-3 bg-gray-50 flex flex-col items-center gap-2">
                  <p className="font-medium text-center">
                    {wyra.wyra_option[1]?.option_text}
                  </p>
                  {wyra.wyra_option[1]?.wyra_media?.[0] &&
                    (wyra.wyra_option[1].wyra_media[0].media_type ===
                    "image" ? (
                      <img
                        src={wyra.wyra_option[1].wyra_media[0].media_url}
                        alt="Option 2 Media"
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <video
                        src={wyra.wyra_option[1].wyra_media[0].media_url}
                        controls
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 flex gap-4">
                <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300">
                  <ThumbsUp className="w-4 h-4 mr-1" size={18} /> 0{" "}
                </span>
                <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300">
                  <ThumbsDown className="w-4 h-4 mr-1" size={18}/> 0
                </span>
                <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300">
                  <MessageCircle className="w-4 h-4 mr-1"  size={18} /> 0 
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
