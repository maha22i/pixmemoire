"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Pencil, UserX, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/forms/ConfirmDialog";
import InviteModal from "./InviteModal";
import type { AdminUser } from "@/types/admin.types";
import { getRoleLabel } from "@/lib/admin/permissions";

interface UsersManagerProps {
  users: AdminUser[];
  currentUserId: string;
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-[#F5A623]/10 text-[#F5A623]",
  editor: "bg-[#3B82F6]/10 text-[#3B82F6]",
  contributor: "bg-[#6B6B6B]/10 text-[#6B6B6B]",
};

export default function UsersManager({
  users,
  currentUserId,
}: UsersManagerProps) {
  const router = useRouter();
  const [showInvite, setShowInvite] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deactivateTarget.id,
          is_active: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success("Utilisateur désactivé.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la désactivation."
      );
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast.success("Rôle modifié avec succès.");
      setEditingUser(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la modification."
      );
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors"
        >
          <Plus size={16} />
          Inviter un admin
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                Dernière connexion
              </th>
              <th className="px-4 py-3 bg-[#F8F8F8]" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isMe = user.id === currentUserId;
              const initials = user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr
                  key={user.id}
                  className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F8F8F8] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623] text-xs font-bold">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {user.full_name}
                          {isMe && (
                            <span className="ml-1.5 text-[10px] text-[#6B6B6B]">
                              (vous)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#6B6B6B]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        ROLE_COLORS[user.role]
                      )}
                    >
                      <Shield size={11} />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={user.is_active ? "active" : "inactive"}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B6B6B]">
                    {user.last_login
                      ? formatDistanceToNow(new Date(user.last_login), {
                          addSuffix: true,
                          locale: fr,
                        })
                      : "Jamais"}
                  </td>
                  <td className="px-4 py-3">
                    {!isMe && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#F5A623]"
                          title="Modifier le rôle"
                        >
                          <Pencil size={15} />
                        </button>
                        {user.is_active && (
                          <button
                            onClick={() => setDeactivateTarget(user)}
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444]"
                            title="Désactiver"
                          >
                            <UserX size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingUser(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Modifier le rôle
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              {editingUser.full_name} ({editingUser.email})
            </p>
            <div className="space-y-2 mb-6">
              {(["super_admin", "editor", "contributor"] as const).map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(editingUser.id, role)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                      editingUser.role === role
                        ? "border-[#F5A623] bg-[#F5A623]/5"
                        : "border-[#E5E5E5] hover:border-[#F5A623]/50"
                    )}
                  >
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {getRoleLabel(role)}
                    </p>
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setEditingUser(null)}
              className="w-full px-4 py-2 text-sm text-[#6B6B6B] bg-[#F8F8F8] rounded-lg hover:bg-[#E5E5E5]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />

      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Désactiver cet utilisateur ?"
        description={`${deactivateTarget?.full_name} ne pourra plus accéder à l'espace admin.`}
        confirmLabel="Désactiver"
        variant="warning"
      />
    </>
  );
}
