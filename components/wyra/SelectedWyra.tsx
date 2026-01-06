"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getWyraById } from "@/actions/wyra";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import WyraSection from "./Wyra";
import Loader from "../common/loader";
import { useSessionUser } from "@/utils/useSessionUser";

interface Props {
  postId?: string;
  setSelectedUserId?: (id: string) => void;
  setActiveTab?: (tab: string) => void;
  disableActions?: any;
}

export default function SelectedWyra({
  postId: propPostId,
  setSelectedUserId,
  setActiveTab,
  disableActions,
}: Props) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const {
    user: sessionUser,
    isVerified,
    isProfileCompleted,
    refetch,
  } = useSessionUser();

  // postId from props OR query
  const postId = propPostId || searchParams.get("postId");

  const [user, setUser] = useState<User | null>(null);
  const [wyra, setWyra] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // Get logged-in user
  // =============================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, [postId]);

  // =============================
  // Fetch single Wyra
  // =============================
  useEffect(() => {
    if (!user || !postId) return;

    const fetchWyra = async () => {
      setLoading(true);
      try {
        const data = await getWyraById(postId, user.id);
        setWyra(data);
      } catch (error) {
        console.error("Error fetching wyra:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWyra();
  }, [user, postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader height={20} width={20} />
      </div>
    );
  }

  if (!wyra) {
    return (
      <div className="text-center py-10 text-gray-500">Wyra not found</div>
    );
  }

  // =============================
  // Render single Wyra ONLY
  // =============================
  return (
    <div className="max-w-3xl mx-auto">
      <WyraSection
        wyras={[wyra]}
        setSelectedUserId={setSelectedUserId}
        setActiveTab={setActiveTab}
        disableActions={disableActions}
      />
    </div>
  );
}
