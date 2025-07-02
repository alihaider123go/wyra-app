import { createClient } from "@/utils/supabase/client";



export async function uploadFiles(
  files: FileList | File[],
  userId: string,
  bucket: string = 'avatars' // change as needed
) {
  const supabase = createClient();
  const uploadedFiles: { name: string; publicUrl: string }[] = [];

  for (const file of Array.from(files)) {
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
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
