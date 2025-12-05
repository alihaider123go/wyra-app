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
        is_edit,
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
  search: string = "",
  page = 1,
  limit = 20
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = createClient();

  // ---- 1. Following users ----
  const { data: followingData } = await supabase
    .from("user_followers")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = followingData?.map((f) => f.following_id) ?? [];

  // ---- 2. Circles user belongs to ----
  const { data: memberCircles } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId);

  const memberCircleIds = memberCircles?.map((r) => r.circle_id) ?? [];

  // ---- 3. Wyra IDs inside those circles ----
  let wyraFromCircles: string[] = [];
  if (memberCircleIds.length > 0) {
    const { data: wyraCircleLinks } = await supabase
      .from("wyra_circles")
      .select("wyra_id")
      .in("circle_id", memberCircleIds);

    wyraFromCircles = wyraCircleLinks?.map((w) => w.wyra_id) ?? [];
  }

  // ---- 4. Blocked users ----
  const { data: blockedUsers } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);

  const blockedIds = blockedUsers?.map((b) => b.blocked_id) ?? [];

  // -------------------------------
  // 🔍 5. Build backend search filter
  // -------------------------------
  let searchFilter = "";

  if (search.trim()) {
    const s = search.toLowerCase();

    searchFilter = `
      user_profiles.username.ilike.%${s}%,
      user_profiles.firstname.ilike.%${s}%,
      user_profiles.lastname.ilike.%${s}%,
      wyra_option.option_text.ilike.%${s}%
    `;
  }

  // -------------------------------
  // 6. MAIN QUERY (with search)
  // -------------------------------

  let query = supabase
    .from("wyra")
    .select(
      `
      id,
      title,
      created_at,
      created_by,
      is_edit,

      user_profiles (
        id,
        firstname,
        lastname,
        username,
        account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed,
          multi_color_why_boxes
        )
      ),

      wyra_circles (
        circle:circles (
          id,
          name
        )
      ),

      wyra_option (
        id,
        option_text,
        is_edit,
        position,
        wyra_media (
          id,
          media_url,
          media_type
        )
      ),

      wyra_selected_option:wyra_selected_option!left (
        id,
        selected_option_id,
        why,
        user_id,
        wyra_option (
          id,
          option_text,
          position
        ),
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          account_settings (
            multi_color_why_boxes
          )
        ),
        wyra_selected_option_reaction:wyra_selected_option_reaction!left (
          id,
          user_id,
          type
        )
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply backend search
  if (searchFilter) {
    query = query.or(searchFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unified Wyras fetch error:", error);
    return [];
  }

  // -------------------------------
  // 7. Remove blocked users directly
  // -------------------------------
  const filteredWyras = (data ?? []).filter(
    (wyra: any) => !blockedIds.includes(wyra.created_by)
  );

  // -------------------------------
  // 8. Resolve Likes Count
  // -------------------------------

  const wyraIds = filteredWyras.map((w) => w.id);

  const { data: reactionData } = await supabase
    .from("wyra_reaction")
    .select("wyra_id")
    .eq("type", "like")
    .in("wyra_id", wyraIds);

  const likeCountsMap: Record<string, number> = {};
  reactionData?.forEach(({ wyra_id }) => {
    likeCountsMap[wyra_id] = (likeCountsMap[wyra_id] || 0) + 1;
  });

  // -------------------------------
  // 9. Format final output
  // -------------------------------
  const formattedData = filteredWyras.map((wyra: any) => {
    const profile = Array.isArray(wyra.user_profiles)
      ? wyra.user_profiles[0]
      : wyra.user_profiles;

    const showReal =
      profile?.account_settings?.show_real_name || userId === wyra.created_by;

    return {
      ...wyra,
      creator: {
        id: profile?.id,
        firstname: showReal ? profile?.firstname : "Anonymous",
        lastname: showReal ? profile?.lastname : "",
        username: profile?.username,
      },
      settings: profile?.account_settings,
      likeCount: likeCountsMap[wyra.id] || 0,
      source: "wyra",
    };
  });

  // -------------------------------
  // 10. Hide Private Creator Posts
  // -------------------------------
  return formattedData.filter((wyra: any) => {
    if (
      wyra.created_by === userId &&
      wyra.settings?.show_posts_public_feed === false
    ) {
      return false;
    }
    return true;
  });
};

export const getAllWyras = async () => {
  const supabase = createClient();

  // 1. Fetch all Wyras
  const { data: wyras, error: wyraError } = await supabase
    .from("wyra")
    .select(
      `
        id,
        title,
        created_at,
        created_by,
        is_edit,
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          account_settings (
            show_real_name
          )
        ),
        wyra_circles (
        circle:circles (
          id,
          name
        )
      ),
        wyra_option (
          id,
          option_text,
          is_edit,
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

  if (wyraError) {
    // console.error("Error fetching wyras:", wyraError);
    return [];
  }

  const wyraIds = wyras?.map((w) => w.id) ?? [];

  // 2. Fetch reactions (likes & dislikes)
  const { data: reactions, error: reactionError } = await supabase
    .from("wyra_reaction")
    .select("wyra_id, type")
    .in("wyra_id", wyraIds);

  if (reactionError) {
    console.error("Error fetching reactions:", reactionError);
  }

  // 3. Count likes & dislikes
  const reactionCounts: Record<string, { like: number; dislike: number }> = {};
  if (reactions) {
    for (const { wyra_id, type } of reactions) {
      if (!reactionCounts[wyra_id]) {
        reactionCounts[wyra_id] = { like: 0, dislike: 0 };
      }
      if (type === "like") {
        reactionCounts[wyra_id].like++;
      } else if (type === "dislike") {
        reactionCounts[wyra_id].dislike++;
      }
    }
  }

  // 4. Fetch comments count
  const { data: comments, error: commentError } = await supabase
    .from("wyra_comment")
    .select("wyra_id")
    .in("wyra_id", wyraIds);

  if (commentError) {
    console.error("Error fetching comments:", commentError);
  }

  const commentCounts: Record<string, number> = {};
  if (comments) {
    for (const { wyra_id } of comments) {
      commentCounts[wyra_id] = (commentCounts[wyra_id] || 0) + 1;
    }
  }

  // 5. Format result
  const formattedWyras = (wyras ?? []).map((wyra) => {
    const { user_profiles, ...rest }: any = wyra;
    const creator =
      Array.isArray(user_profiles) && user_profiles.length > 0
        ? user_profiles[0]
        : user_profiles;

    return {
      ...rest,
      creator: {
        id: creator?.id,
        firstname: creator?.account_settings?.show_real_name
          ? creator?.firstname
          : "Anonymous",
        lastname: creator?.account_settings?.show_real_name
          ? creator?.lastname
          : "",
        username: creator?.username,
      },
      likeCount: reactionCounts[wyra.id]?.like || 0,
      dislikeCount: reactionCounts[wyra.id]?.dislike || 0,
      commentCount: commentCounts[wyra.id] || 0,
    };
  });

  return formattedWyras;
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
        is_edit,
        user_profiles (
          id,
          firstname,
          lastname,
          username,
            account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed,
          multi_color_why_boxes
        )
        ),
        wyra_circles (
        circle:circles (
          id,
          name
        )
      ),
         wyra_option (
          id,
          option_text,
          is_edit,
          position,
          wyra_media (
            id,
            media_url,
            media_type
          )
        ),
        wyra_selected_option:wyra_selected_option!left (
          id,
          selected_option_id,
          why,
          user_id,
          wyra_option (
            id,
            option_text,
            position
          ),
          user_profiles (
            id,
            firstname,
            lastname,
            username,
                        account_settings (
              multi_color_why_boxes
            )
          ),
          wyra_selected_option_reaction:wyra_selected_option_reaction!left (
            id,
            user_id,
            type
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
              firstname:
                user_profiles[0]?.account_settings?.show_real_name ||
                userId === wyra.created_by
                  ? user_profiles[0]?.firstname
                  : "Anonymous",
              lastname:
                user_profiles[0]?.account_settings?.show_real_name ||
                userId === wyra.created_by
                  ? user_profiles[0]?.lastname
                  : "",
              username: user_profiles[0]?.username,
            }
          : {
              id: user_profiles?.id,
              firstname:
                user_profiles?.account_settings?.show_real_name ||
                userId === wyra.created_by
                  ? user_profiles?.firstname
                  : "Anonymous",
              lastname:
                user_profiles?.account_settings?.show_real_name ||
                userId === wyra.created_by
                  ? user_profiles?.lastname
                  : "",
              username: user_profiles?.username,
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
    const searchWords = search.toLowerCase().split(/\s+/); // split by spaces

    formattedData = formattedData.filter((wyra) => {
      const username =
        wyra.creator?.username?.toLowerCase() ||
        wyra.creator?.firstname?.toLowerCase() ||
        "";
      const optionTexts =
        wyra.wyra_option?.map((opt: any) => opt.option_text.toLowerCase()) ||
        [];

      // Check if ANY search word matches username or option texts
      return searchWords.some(
        (word) =>
          username.includes(word) ||
          optionTexts.some((text: any) => text.includes(word))
      );
    });
  }

  return formattedData;
};

export const getWyrasWithCircles = async (
  userId: string,
  search: string = ""
) => {
  const supabase = createClient();

  // ✅ Fetch wyras with circles
  const { data, error } = await supabase.from("wyra").select(`
      id,
      title,
      created_at,
      created_by,
      is_edit,
      user_profiles (
        id,
        firstname,
        lastname,
        username,
          account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed,
          multi_color_why_boxes
        )
      ),
      wyra_option (
          id,
          option_text,
          is_edit,
          position,
          wyra_media (
            id,
            media_url,
            media_type
          )
        ),
        wyra_selected_option:wyra_selected_option!left (
          id,
          selected_option_id,
          why,
          user_id,
          wyra_option (
            id,
            option_text
          ),
          user_profiles (
            id,
            firstname,
            lastname,
            username,
                        account_settings (
              multi_color_why_boxes
            )
          ),
          wyra_selected_option_reaction:wyra_selected_option_reaction!left (
            id,
            user_id,
            type
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
    // console.error("Wyras fetch error:", error);
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
                firstname:
                  user_profiles[0]?.account_settings?.show_real_name ||
                  userId === wyra.created_by
                    ? user_profiles[0]?.firstname
                    : "Anonymous",
                lastname:
                  user_profiles[0]?.account_settings?.show_real_name ||
                  userId === wyra.created_by
                    ? user_profiles[0]?.lastname
                    : "",
                username: user_profiles[0]?.username,
              }
            : {
                id: user_profiles?.id,
                firstname:
                  user_profiles?.account_settings?.show_real_name ||
                  userId === wyra.created_by
                    ? user_profiles?.firstname
                    : "Anonymous",
                lastname:
                  user_profiles?.account_settings?.show_real_name ||
                  userId === wyra.created_by
                    ? user_profiles?.lastname
                    : "",
                username: user_profiles?.username,
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
    const searchWords = search.toLowerCase().split(/\s+/); // split by spaces

    formattedData = formattedData.filter((wyra) => {
      const username =
        wyra.creator?.username?.toLowerCase() ||
        wyra.creator?.firstname?.toLowerCase() ||
        "";
      const circleNames =
        wyra.circles?.map((c: any) => c.name.toLowerCase()) || [];

      const optionTexts =
        wyra.wyra_option?.map((opt: any) => opt.option_text.toLowerCase()) ||
        [];

      // Check if ANY search word matches username or option texts
      return searchWords.some(
        (word) =>
          username.includes(word) ||
          optionTexts.some((text: any) => text.includes(word)) ||
          circleNames.some((name: string) => name.includes(word))
      );
    });
  }

  return formattedData;
};

export async function deleteWyra(wyraId: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase.from("wyra").delete().eq("id", wyraId);

    if (error) {
      throw error;
    }

    return { success: true, message: "Wyra deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting Wyra:", error.message);
    return { success: false, message: error.message };
  }
}

export const searchUsers = async (search: string, userProfileId: string) => {
  if (!search.trim()) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, firstname, lastname, username, email")
    .or(
      `firstname.ilike.%${search}%,lastname.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
    )
    .neq("id", userProfileId) // exclude current user
    .limit(5);

  if (error) {
    console.error("User search error:", error);
    return [];
  }

  return (data || []).map((user) => ({
    ...user,
    source: "user", // ✅ add marker
  }));
};

export const unifiedSearch = async (userId: any, search: string) => {
  const [userResults, wyraResults] = await Promise.all([
    searchUsers(search, userId),
    getUnifiedHomeWyras(userId, search),
  ]);

  return [...userResults, ...wyraResults];
};


export const getWyraById = async (wyraId: string, userId: any) => {
  const supabase = createClient();

  // 1. Fetch blocked users
  const { data: blockedUsers, error: blockError } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);

  const blockedIds = blockedUsers?.map((b) => b.blocked_id) ?? [];

  if (blockError) {
    console.error("Error fetching blocked users:", blockError);
    return null;
  }

  // 2. Fetch Wyra with relations
  const { data, error } = await supabase
    .from("wyra")
    .select(
      `
      id,
      title,
      created_at,
      created_by,
      is_edit,
      user_profiles (
        id,
        firstname,
        lastname,
        username,
          account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed,
          multi_color_why_boxes
        )
      ),

      wyra_circles (
        circle:circles ( id, name )
      ),

      wyra_option (
        id,
        option_text,
        is_edit,
        position,
        wyra_media (
          id,
          media_url,
          media_type
        )
      ),

      wyra_selected_option:wyra_selected_option!left (
        id,
        selected_option_id,
        why,
        user_id,
        wyra_option (
          id,
          option_text,
          position
        ),
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          account_settings ( multi_color_why_boxes )
        ),
        wyra_selected_option_reaction:wyra_selected_option_reaction!left (
          id,
          user_id,
          type
        )
      )
    `
    )
    .eq("id", wyraId)
    .single();

  if (error) {
    console.error("Error fetching Wyra:", error);
    return null;
  }

  // 3. Blocked user check
  if (blockedIds.includes(data.created_by)) {
    return null;
  }

  // 4. Fetch like count
  const { data: reactionData } = await supabase
    .from("wyra_reaction")
    .select("wyra_id")
    .eq("type", "like")
    .eq("wyra_id", wyraId);

  const likeCount = reactionData?.length || 0;

  // 5. Format creator object
  const userProfile:any = Array.isArray(data.user_profiles)
    ? data.user_profiles[0]
    : data.user_profiles;

  const creator = {
    id: userProfile?.id,
    firstname:
      userProfile?.account_settings?.show_real_name ||
      userId === data.created_by
        ? userProfile?.firstname
        : "Anonymous",
    lastname:
      userProfile?.account_settings?.show_real_name ||
      userId === data.created_by
        ? userProfile?.lastname
        : "",
    username: userProfile?.username,
  };

  const settings = userProfile?.account_settings;

  // 6. Privacy: hide if not allowed
  if (
    data.created_by === userId &&
    settings?.show_posts_public_feed === false
  ) {
    return null;
  }

  // 7. Final formatted result
  return {
    ...data,
    creator,
    settings,
    likeCount,
    source: "wyra",
  };
};


export const getFollowingUsersWyras = async (
  userId: string,
) => {
  const supabase = createClient();
  // ------------------------------------
  // 1. Get all users that I follow
  // ------------------------------------
  const { data: followingData, error: followingErr } = await supabase
    .from("user_followers")
    .select("following_id")
    .eq("follower_id", userId);

  if (followingErr) {
    console.error("Following list error:", followingErr);
    return [];
  }

  const followingIds = followingData?.map((f) => f.following_id) ?? [];
  if (followingIds.length === 0) return []; // user follows no one

  // ------------------------------------
  // 2. Get blocked users to exclude them
  // ------------------------------------
  const { data: blockedUsers } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);

  const blockedIds = blockedUsers?.map((b) => b.blocked_id) ?? [];

  // ------------------------------------
  // 3. Main Wyra Query (only following users)
  // ------------------------------------
  const { data, error } = await supabase
    .from("wyra")
    .select(
      `
      id,
      title,
      created_at,
      created_by,
      is_edit,

      user_profiles (
        id,
        firstname,
        lastname,
        username,
        account_settings (
          show_real_name,
          animate_floating_effects,
          show_edited_tag,
          show_posts_public_feed,
          multi_color_why_boxes
        )
      ),

      wyra_option (
        id,
        option_text,
        is_edit,
        position,
        wyra_media (
          id,
          media_url,
          media_type
        )
      ),

      wyra_selected_option:wyra_selected_option!left (
        id,
        selected_option_id,
        why,
        user_id,
        wyra_option (
          id,
          option_text,
          position
        ),
        user_profiles (
          id,
          firstname,
          lastname,
          username,
          account_settings (
            multi_color_why_boxes
          )
        ),
        wyra_selected_option_reaction:wyra_selected_option_reaction!left (
          id,
          user_id,
          type
        )
      )
    `,
      { count: "exact" }
    )
    .in("created_by", followingIds) // ❤️ THIS IS THE MAIN FILTER
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Following Users Wyras error:", error);
    return [];
  }

  // ------------------------------------
  // 4. Remove blocked creators
  // ------------------------------------
  const filteredWyras = (data ?? []).filter(
    (wyra) => !blockedIds.includes(wyra.created_by)
  );

  // ------------------------------------
  // 5. Resolve Like Counts
  // ------------------------------------
  const wyraIds = filteredWyras.map((w) => w.id);

  const { data: likeData } = await supabase
    .from("wyra_reaction")
    .select("wyra_id")
    .eq("type", "like")
    .in("wyra_id", wyraIds);

  const likeCountsMap: Record<string, number> = {};
  likeData?.forEach(({ wyra_id }) => {
    likeCountsMap[wyra_id] = (likeCountsMap[wyra_id] || 0) + 1;
  });

  // ------------------------------------
  // 6. Final Formatted Output
  // ------------------------------------
  return filteredWyras.map((wyra: any) => {
    const profile = Array.isArray(wyra.user_profiles)
      ? wyra.user_profiles[0]
      : wyra.user_profiles;

    const showReal =
      profile?.account_settings?.show_real_name || userId === wyra.created_by;

    return {
      ...wyra,
      creator: {
        id: profile?.id,
        firstname: showReal ? profile?.firstname : "Anonymous",
        lastname: showReal ? profile?.lastname : "",
        username: profile?.username,
      },
      settings: profile?.account_settings,
      likeCount: likeCountsMap[wyra.id] || 0,
      source: "following", // 🔥 to identify where it came from
    };
  });
};

