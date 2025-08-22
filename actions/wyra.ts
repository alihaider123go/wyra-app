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

export const getUnifiedHomeWyras = async (
  userId: string,
  search: string = ""
) => {
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

  // 4. Get blocked user IDs
  const { data: blockedUsers, error: blockError } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);

  if (blockError) {
    console.error("Error fetching blocked users:", blockError);
    return [];
  }

  const blockedIds = blockedUsers?.map((b) => b.blocked_id) ?? [];

  // 5. Build OR filter (optional — disabled in your code)
  const allAuthorIds = [...followingIds];
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

  // 6. Fetch Wyras
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
        avatar,
        account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed
        )
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

  // Uncomment if you want to filter by authors/circles
  // if (orFilters.length > 0) {
  //   query = query.or(orFilters.join(","));
  // }

  const { data, error } = await query;

  if (error) {
    console.error("Unified Wyras fetch error:", error);
    return [];
  }

  // 7. Filter out blocked users' wyras
  const filteredWyras = (data ?? []).filter(
    (wyra) => !blockedIds.includes(wyra.created_by)
  );

  // 8. Extract Wyra IDs
  const wyraIds = filteredWyras.map((w) => w.id);

  // 9. Fetch "like" reactions for these Wyras
  const { data: reactionData, error: reactionError } = await supabase
    .from("wyra_reaction")
    .select("wyra_id")
    .eq("type", "like")
    .in("wyra_id", wyraIds);

  if (reactionError) {
    console.error("Error fetching like reactions:", reactionError);
  }

  // 10. Count likes
  let likeCountsMap: Record<string, number> = {};
  if (reactionData) {
    for (const { wyra_id } of reactionData) {
      likeCountsMap[wyra_id] = (likeCountsMap[wyra_id] || 0) + 1;
    }
  }
  // 11. Format result
  let formattedData: Wyra[] = filteredWyras.map((wyra) => {
    const { user_profiles, ...rest }: any = wyra;
    return {
      ...rest,
      creator: Array.isArray(user_profiles)
        ? {
            id: user_profiles[0]?.id,
            firstname: user_profiles[0]?.account_settings?.show_real_name
              ? user_profiles[0]?.firstname
              : "Anonymous",
            lastname: user_profiles[0]?.account_settings?.show_real_name
              ? user_profiles[0]?.lastname
              : "",
            username: user_profiles[0]?.username,
            avatar: user_profiles[0]?.avatar,
          }
        : {
            id: user_profiles?.id,
            firstname: user_profiles?.account_settings?.show_real_name
              ? user_profiles?.firstname
              : "Anonymous",
            lastname: user_profiles?.account_settings?.show_real_name
              ? user_profiles?.lastname
              : "",
            username: user_profiles?.username,
            avatar: user_profiles?.avatar,
          },
      settings: Array.isArray(user_profiles)
        ? user_profiles[0]?.account_settings
        : user_profiles?.account_settings,
      likeCount: likeCountsMap[wyra.id] || 0,
    };
  });

  // 12. Apply search filter
  if (search.trim()) {
    const lowerSearch = search.toLowerCase();

    formattedData = formattedData.filter((wyra) => {
      const username =
        wyra.creator?.username?.toLowerCase() ||
        wyra.creator?.firstname?.toLowerCase() ||
        "";
      const optionTexts =
        wyra.wyra_option?.map((opt) => opt.option_text.toLowerCase()) || [];

      return (
        username.includes(lowerSearch) ||
        optionTexts.some((text) => text.includes(lowerSearch))
      );
    });
  }

  formattedData = formattedData.filter((wyra:any) => {
    if (wyra.created_by === userId && wyra.settings?.show_posts_public_feed === false) {
      return false;
    }
    return true;
  });

  return formattedData;
};

export const getFavoriteWyras = async (userId: string, search: string = "") => {
  const supabase = createClient();

  // ✅ Fetch all favorites (unsorted)
  const { data, error } = await supabase
    .from("wyra_favorites")
    .select(
      `
      wyra (
        id,
        title,
        created_at,
        created_by,
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          avatar,
            account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed
        )
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
      )
      `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Favorite Wyras fetch error:", error);
    return [];
  }

  // ✅ Extract Wyra objects
  let formattedData: any[] =
    data?.map((fav: any) => {
      const wyra = fav.wyra;
      if (!wyra) return null;

      const { user_profiles, ...rest } = wyra;
      return {
        ...rest,
        creator: Array.isArray(user_profiles)
          ? {
              id: user_profiles[0]?.id,
              firstname: user_profiles[0]?.account_settings?.show_real_name
                ? user_profiles[0]?.firstname
                : "Anonymous",
              lastname: user_profiles[0]?.account_settings?.show_real_name
                ? user_profiles[0]?.lastname
                : "",
              username: user_profiles[0]?.username,
              avatar: user_profiles[0]?.avatar,
            }
          : {
              id: user_profiles?.id,
              firstname: user_profiles?.account_settings?.show_real_name
                ? user_profiles?.firstname
                : "Anonymous",
              lastname: user_profiles?.account_settings?.show_real_name
                ? user_profiles?.lastname
                : "",
              username: user_profiles?.username,
              avatar: user_profiles?.avatar,
            },
        settings: Array.isArray(user_profiles)
          ? user_profiles[0]?.account_settings
          : user_profiles?.account_settings,
      };
    }) ?? [];

  formattedData = formattedData.filter(Boolean);

  // ✅ Sort by Wyra creation date (DESC)
  formattedData.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // ✅ Search Filter (username or option_text)
  if (search.trim()) {
    const lowerSearch = search.toLowerCase();

    formattedData = formattedData.filter((wyra) => {
      const username =
        wyra.creator?.username?.toLowerCase() ||
        wyra.creator?.firstname?.toLowerCase() ||
        "";
      const optionTexts =
        wyra.wyra_option?.map((opt: any) => opt.option_text.toLowerCase()) ||
        [];

      return (
        username.includes(lowerSearch) ||
        optionTexts.some((text: any) => text.includes(lowerSearch))
      );
    });
  }

  return formattedData;
};

export const getWyrasWithCircles = async (search: string = "") => {
  const supabase = createClient();

  // ✅ Fetch wyras with circles
  const { data, error } = await supabase.from("wyra").select(`
      id,
      title,
      created_at,
      created_by,
      user_profiles (
        id,
        firstname,
        lastname,
        username,
        avatar,
          account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed
        )
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
      ),
      wyra_circles (
        circle:circles (
          id,
          name
        )
      )
    `);

  if (error) {
    console.error("Wyras fetch error:", error);
    return [];
  }

  // ✅ Format the data
  // ✅ Format the data and remove wyras with no circles
  let formattedData: any[] =
    data
      ?.map((wyra: any) => {
        const { user_profiles, wyra_circles, ...rest } = wyra;

        const circles =
          wyra_circles?.map((wc: any) => wc.circle).filter(Boolean) || [];

        return {
          ...rest,
          creator: Array.isArray(user_profiles)
            ? {
                id: user_profiles[0]?.id,
                firstname: user_profiles[0]?.account_settings?.show_real_name
                  ? user_profiles[0]?.firstname
                  : "Anonymous",
                lastname: user_profiles[0]?.account_settings?.show_real_name
                  ? user_profiles[0]?.lastname
                  : "",
                username: user_profiles[0]?.username,
                avatar: user_profiles[0]?.avatar,
              }
            : {
                id: user_profiles?.id,
                firstname: user_profiles?.account_settings?.show_real_name
                  ? user_profiles?.firstname
                  : "Anonymous",
                lastname: user_profiles?.account_settings?.show_real_name
                  ? user_profiles?.lastname
                  : "",
                username: user_profiles?.username,
                avatar: user_profiles?.avatar,
              },
          settings: Array.isArray(user_profiles)
            ? user_profiles[0]?.account_settings
            : user_profiles?.account_settings,

          circles,
        };
      })
      .filter((wyra) => wyra.circles.length > 0) ?? [];

  // ✅ Sort by creation date DESC
  formattedData.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // ✅ Search filter (username, option_text, circle name)
  if (search.trim()) {
    const lowerSearch = search.toLowerCase();

    formattedData = formattedData.filter((wyra) => {
      const username =
        wyra.creator?.username?.toLowerCase() ||
        wyra.creator?.firstname?.toLowerCase() ||
        "";
      const optionTexts =
        wyra.wyra_option?.map((opt: any) => opt.option_text.toLowerCase()) ||
        [];
      const circleNames =
        wyra.circles?.map((c: any) => c.name.toLowerCase()) || [];

      return (
        username.includes(lowerSearch) ||
        optionTexts.some((text: any) => text.includes(lowerSearch)) ||
        circleNames.some((name: string) => name.includes(lowerSearch))
      );
    });
  }

  return formattedData;
};
