import type { AdminRole } from "@/types/admin.types";

type AdminAction =
  | "create"
  | "edit"
  | "publish"
  | "delete"
  | "manage_users"
  | "manage_categories"
  | "manage_settings"
  | "view_logs";

const ROLE_PERMISSIONS: Record<AdminRole, Set<AdminAction>> = {
  super_admin: new Set([
    "create",
    "edit",
    "publish",
    "delete",
    "manage_users",
    "manage_categories",
    "manage_settings",
    "view_logs",
  ]),
  editor: new Set([
    "create",
    "edit",
    "publish",
    "delete",
    "manage_categories",
    "view_logs",
  ]),
  contributor: new Set(["create", "edit"]),
};

export function hasPermission(role: AdminRole, action: AdminAction): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function canCreate(role: AdminRole): boolean {
  return hasPermission(role, "create");
}

export function canEdit(role: AdminRole): boolean {
  return hasPermission(role, "edit");
}

export function canPublish(role: AdminRole): boolean {
  return hasPermission(role, "publish");
}

export function canDelete(role: AdminRole): boolean {
  return hasPermission(role, "delete");
}

export function canManageUsers(role: AdminRole): boolean {
  return hasPermission(role, "manage_users");
}

export function canManageCategories(role: AdminRole): boolean {
  return hasPermission(role, "manage_categories");
}

export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    editor: "Éditeur",
    contributor: "Contributeur",
  };
  return labels[role] || role;
}
