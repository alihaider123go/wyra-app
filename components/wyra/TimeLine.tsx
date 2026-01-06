"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getFollowingUsersWyras,
  getUnifiedHomeWyras,
  getWyraById,
  getWyrasWithCircles,
} from "@/actions/wyra";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Loader from "../common/loader";
import WyraSection from "./Wyra";
import CirclesWyras from "./CirclesWyra";
import { FaUsers } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Clock, Sparkles } from "lucide-react";

export default function WyraTimeline({
  searchTerm,
  postId,
  setActiveTab,
  setSelectedUserId,
  setPostId,
}: any) {
  const supabase = createClient();

  const [wyraList, setWyraList] = useState<any[]>([]);
  const [circleList, setCircleList] = useState<any[]>([]);
  const [followingWyraList, setFollowingWyraList] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeatureTab, setActiveFeatureTab] = useState("recent");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
      setLoading(false);
    });
  }, []);

  const fetchWyras = useCallback(
    async (reset = false) => {
      if (!user || isFetchingRef.current) return;
      if (!reset && !hasMoreRef.current) return;

      isFetchingRef.current = true;

      const limit = 20;

      try {
        const data = await getUnifiedHomeWyras(
          user.id,
          debouncedSearch,
          reset ? 1 : pageRef.current,
          limit
        );

        setWyraList((prev) => {
          if (reset) return data;

          const existingIds = new Set(prev.map((w) => w.id));
          const filtered = data.filter((w) => !existingIds.has(w.id));

          return [...prev, ...filtered];
        });

        pageRef.current = reset ? 2 : pageRef.current + 1;
        hasMoreRef.current = data.length === limit;
      } catch (err) {
        console.error("Error fetching wyras:", err);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [user, debouncedSearch]
  );

  useEffect(() => {
    if (!user) return;

    pageRef.current = 1;
    hasMoreRef.current = true;
    setWyraList([]);
    fetchWyras(true);
  }, [debouncedSearch, activeFeatureTab, user, fetchWyras]);

  // =============================
  // Fetch circle wyras
  // =============================
  const fetchCircleWyras = useCallback(async () => {
    if (!user) return;
    const data = await getWyrasWithCircles(user.id, debouncedSearch);
    setCircleList(data || []);
  }, [user, debouncedSearch]);

  const fetchFollowingUsersWyras = useCallback(async () => {
    if (!user) return;
    const data = await getFollowingUsersWyras(user.id);
    setFollowingWyraList(data || []);
  }, [user, debouncedSearch]);

  useEffect(() => {
    fetchCircleWyras();
    fetchFollowingUsersWyras();
  }, [fetchCircleWyras]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          !isFetchingRef.current &&
          hasMoreRef.current
        ) {
          fetchWyras(false);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchWyras]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const tabs = [
    { id: "recent", icon: Clock, label: "Recent", isImage: false },
    { id: "trending", icon: TrendingUp, label: "Trending", isImage: false },
    { id: "circles", icon: "/team.png", label: "Circles", isImage: true },
    { id: "following", icon: Sparkles, label: "Following", isImage: false },
  ];

  return (
    <>
      {/* Floating plus button */}
      <Button
        onClick={() => {}}
        className="rounded-full h-12 w-12 fixed bottom-[5%] right-[5%] z-50 hidden md:flex items-center justify-center"
      >
        <Plus className="h-8 w-8 text-white dark:text-black" />
      </Button>

      {/* Tabs */}
      <div className="max-w-3xl flex items-center justify-around gap-4 py-2 px-2">
        {tabs.map((tab) => {
          const isActive = activeFeatureTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFeatureTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 w-full rounded-2xl transition-all ${
                isActive
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110"
                  : "text-gray-500"
              }`}
            >
              {tab.isImage ? (
                <FaUsers className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
              <span className="text-xs mt-1 font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-3xl">
        {activeFeatureTab === "circles" ? (
          <CirclesWyras
            wyras={circleList}
            fetchWyras={fetchCircleWyras}
            setSelectedUserId={setSelectedUserId}
            setActiveTab={setActiveTab}
          />
        ) : activeFeatureTab === "trending" ? (
          <WyraSection
            wyras={wyraList.filter((w) => w.likeCount > 10)}
            setSelectedUserId={setSelectedUserId}
            setActiveTab={setActiveTab}
            fetchWyras={fetchWyras}
          />
        ) : activeFeatureTab === "recent" ? (
          <>
            <WyraSection
              wyras={wyraList}
              setSelectedUserId={setSelectedUserId}
              setActiveTab={setActiveTab}
              fetchWyras={fetchWyras}
            />

            {/* Loader */}
            {hasMoreRef.current && (
              <div ref={loaderRef} className="flex justify-center py-6">
                <Loader height={16} width={16} />
              </div>
            )}
          </>
        ) : (
          <WyraSection
            wyras={followingWyraList}
            setSelectedUserId={setSelectedUserId}
            setActiveTab={setActiveTab}
            fetchWyras={fetchWyras}
          />
        )}
      </div>
    </>
  );
}
