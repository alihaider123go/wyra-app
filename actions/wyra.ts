import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { headers } from "next/headers";
import { error } from "console";
import { Wyra, WyraInsertInput } from "./types";

export async function insertWyra(data: WyraInsertInput) {
  const supabase = await createClient();
  const { data: wyra, error: wyraError } = await supabase
    .from("wyra")
    .insert([{ title: data.title, created_by: data.created_by }])
    .select("id")
    .single();

  if (wyraError || !wyra) {
    throw new Error(wyraError?.message || "Failed to insert wyra");
  }

  // Insert options with media
  for (let i = 0; i < data.options.length; i++) {
    const option = data.options[i];
    const { data: optionData, error: optionError } = await supabase
      .from("wyra_option")
      .insert([
        {
          wyra_id: wyra.id,
          option_text: option.option_text,
          position: i + 1,
        },
      ])
      .select("id")
      .single();

    if (optionError || !optionData) {
      throw new Error(optionError?.message || "Failed to insert option");
    }

    // Insert media for this option
    for (const mediaFile of option.media_files) {
      const { error: mediaError } = await supabase.from("wyra_media").insert([
        {
          wyra_option_id: optionData.id,
          media_url: mediaFile.url,
          media_type: mediaFile.media_type,
        },
      ]);

      if (mediaError) {
        throw new Error(mediaError.message);
      }
    }
  }
  return wyra;
}

export async function getMyWyras(userId: string) {
  const supabase = await createClient();

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
    throw new Error(error.message);
  }

  return data;
}

export const getUnifiedHomeWyras = async (userId: string) => {
  const supabase = createClient();

  // 1. Get following IDs
  const { data: followingData, error: followError } = await supabase
    .from("user_followers")
    .select("following_id")
    .eq("follower_id", userId);

  if (followError) {
    console.error("Error fetching following:", followError);
    return [];
  }

  const followingIds = followingData?.map((f) => f.following_id) ?? [];

  // 2. Get circles where user is a member
  const { data: memberCircles, error: memberError } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId);

  if (memberError) {
    console.error("Error fetching circle memberships:", memberError);
    return [];
  }

  const memberCircleIds = memberCircles?.map((r) => r.circle_id) ?? [];

  // 3. Get Wyra IDs from those circles
  let wyraFromCircles: string[] = [];
  if (memberCircleIds.length > 0) {
    const { data: wyraCircleLinks, error: linkError } = await supabase
      .from("wyra_circles")
      .select("wyra_id")
      .in("circle_id", memberCircleIds);

    if (linkError) {
      console.error("Error fetching wyra_circles:", linkError);
      return [];
    }

    wyraFromCircles = wyraCircleLinks?.map((w) => w.wyra_id) ?? [];
  }

  // 4. Build OR condition string
  const allAuthorIds = [userId, ...followingIds];
  const orFilters: string[] = [];

  if (allAuthorIds.length > 0) {
    const authorFilter = allAuthorIds
      .map((id) => `created_by.eq.${id}`)
      .join(",");
    orFilters.push(authorFilter);
  }

  if (wyraFromCircles.length > 0) {
    const wyraFilter = wyraFromCircles.map((id) => `id.eq.${id}`).join(",");
    orFilters.push(wyraFilter);
  }

  // 5. Final query
  let query = supabase
    .from("wyra")
    .select(
      `
      id,
      title,
      created_at,
      created_by,
      user_profiles (
        id,
        firstname,
        lastname,
        username,
        avatar
      ),
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
    .order("created_at", { ascending: false });

  if (orFilters.length > 0) {
    query = query.or(orFilters.join(","));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unified Wyras fetch error:", error);
    return [];
  }

  // ✅ Rename `user_profiles` to `creator`
  const formattedData: Wyra[] = (data ?? []).map((wyra) => {
    const { user_profiles, ...rest } = wyra;
    return {
      ...rest,
      creator: Array.isArray(user_profiles) ? user_profiles[0] : user_profiles,
    };
  });

  return formattedData;
};
