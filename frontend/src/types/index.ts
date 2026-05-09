export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description?: string | null;
  tags: string[];
  created_at: string;
}

export interface ResourceFormData {
  title: string;
  url: string;
  description?: string;
  tags: string[];
}
