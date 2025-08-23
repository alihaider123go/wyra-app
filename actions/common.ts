import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import moment from "moment";

export async function uploadFiles(
  files: FileList | File[],
  userId: string,
  bucket: string = "profile-avatars" // change as needed
) {
  const supabase = createClient();
  const uploadedFiles: { name: string; publicUrl: string }[] = [];

  for (const file of Array.from(files)) {
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`Failed to upload ${file.name}:`, error.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    uploadedFiles.push({
      name: file.name,
      publicUrl: publicUrlData.publicUrl,
    });
  }

  return uploadedFiles;
}

export async function updateLastSeen(userId: any) {
  const supabase = createClient();

  await supabase
    .from("user_profiles")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", userId);
}

export function checkUserOnlineStatus(userId: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [userData, setUserData] = useState<any>();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    let active = true; // to avoid state updates after unmount

    const fetchStatus = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("last_seen,account_settings(show_online_status)")
        .eq("id", userId)
        .single();

      if (data && active) {
        setUserData(data)
        const lastSeen = moment(data.last_seen);
        setIsOnline(moment().diff(lastSeen, "seconds") < 60);
      }
    };

    fetchStatus();

    const channel = supabase
      .channel(`user-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (!active) return;
          const lastSeen = moment(payload.new.last_seen);
          setIsOnline(moment().diff(lastSeen, "seconds") < 60);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);
  return isOnline && userData?.account_settings?.show_online_status;
}
