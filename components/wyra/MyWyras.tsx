"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, relativeTime } from "@/utils/helper";
import { Button } from "@/components/ui/button"

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
  userId: string | undefined;
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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (wyraList.length === 0)
    return <div className="text-center py-10">No Wyras yet.</div>;

  return (
    <>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : wyraList.length === 0 ? (
        <div className="text-center py-10">No Wyras yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {wyraList.map((wyra) => (
            <div
              key={wyra.id}
              className="border rounded-xl p-4 shadow  hover:bg-gray-100 hover:shadow-md transition relative bg-white flex flex-col gap-4"
            >
              <p className="text-sm text-gray-500">
                {formatDate(wyra.created_at)} • {relativeTime(wyra.created_at)}
              </p>

              {/* Options Row */}
              <div className="md:flex items-center md:justify-between gap-4">
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
                <div className="text-gray-500 font-bold text-center my-2">OR</div>

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
                <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-green-200 text-gray-800 hover:bg-green-300">
                  <ThumbsUp className="w-4 h-4 mr-1" size={18} /> 0{" "}
                </span>
                <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-red-200 text-gray-800 hover:bg-red-300">
                  <ThumbsDown className="w-4 h-4 mr-1" size={18}/> 0
                </span>
                <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium transition bg-blue-200 text-gray-800 hover:bg-blue-300">
                  <MessageCircle className="w-4 h-4 mr-1"  size={18} /> 0 
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
