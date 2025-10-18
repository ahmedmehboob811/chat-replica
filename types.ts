
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface Chat {
  id: number;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  user_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profiles: Profile; // Supabase will join this for us
}
