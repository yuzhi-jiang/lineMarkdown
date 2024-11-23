export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  updated_at: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}