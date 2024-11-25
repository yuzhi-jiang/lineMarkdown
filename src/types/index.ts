export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  updated_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShareSettings {
  id?: string;
  document_id: string;
  share_id: string;
  is_public: boolean;
  password: string | null;
  expiry_date: string | null;
  created_at: string;
}