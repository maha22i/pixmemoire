import { createClient } from "@/lib/supabase/server";

interface LogActivityParams {
  adminId: string;
  action: "create" | "update" | "delete" | "publish" | "login";
  entityType: "personality" | "category" | "user" | "suggestion" | "media";
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Enregistre une action admin dans la table activity_logs.
 * Ne lève jamais d'erreur — les échecs sont silencieux pour
 * ne pas bloquer l'action principale.
 */
export async function logActivity({
  adminId,
  action,
  entityType,
  entityId,
  details = {},
  ipAddress,
}: LogActivityParams): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from("activity_logs").insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details,
      ip_address: ipAddress || null,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du log d'activité:", error);
  }
}
