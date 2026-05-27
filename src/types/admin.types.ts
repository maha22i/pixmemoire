export type AdminRole = "super_admin" | "editor" | "contributor";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  created_by: string | null;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: "create" | "update" | "delete" | "publish" | "login";
  entity_type: "personality" | "category" | "user" | "suggestion" | "media";
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  admin?: AdminUser;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  alt_text: string;
  uploaded_by: string;
  folder: "portraits" | "gallery" | "documents" | "general";
  tags: string[];
  created_at: string;
}

export interface DashboardStats {
  totalPublished: number;
  totalDrafts: number;
  pendingSuggestions: number;
  totalViewsThisMonth: number;
}
