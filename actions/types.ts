import { User } from "@supabase/supabase-js";

export type WyraInsertInput = {
  title?: string | null; // optional title, can be null
  created_by?: string; // user id if any
  options: {
    option_text: string;
    media_files: { url: string; media_type: "image" | "video" }[];
  }[];
};
export interface Chat {
  id: string;
  name: string | null;
  avatar?: string | null;
  username?: string;
  is_group: boolean;
  lastMessage?: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
}
export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  joined_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  avatar?: string;
  gender?:string;
  dob?: string;
  email?: string;
  bio?: string;
}

export interface Circle {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface WyraMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
}

export interface WyraOption {
  id: string;
  option_text: string;
  position: number;
  wyra_media: WyraMedia[];
}

export interface Wyra {
  id: string;
  title?: string;
  created_at: string;
  created_by: string;
  creator: UserProfile;
  wyra_option: WyraOption[];
}


export type ExtendedUser = User & {
  user_profile: UserProfile; // or replace `any` with your actual profile type
  isVerified?: boolean;
};