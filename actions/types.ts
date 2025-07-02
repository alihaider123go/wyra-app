export type WyraInsertInput = {
  title?: string | null; // optional title, can be null
  created_by?: string; // user id if any
  options: {
    option_text: string;
    media_files: { url: string; media_type: "image" | "video" }[];
  }[];
};