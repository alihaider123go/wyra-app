import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { headers } from "next/headers";
import { error } from "console";
import { WyraInsertInput } from "./types";

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
