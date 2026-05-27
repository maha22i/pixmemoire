"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Key, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/types/admin.types";
import { getRoleLabel } from "@/lib/admin/permissions";

const profileSchema = z.object({
  full_name: z.string().min(1, "Le nom est requis"),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface SettingsPageProps {
  user: AdminUser;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user.full_name },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("admin_users")
        .update({ full_name: data.full_name })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil mis à jour avec succès.");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil.");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success("Mot de passe modifié avec succès.");
      passwordForm.reset();
      setChangingPassword(false);
    } catch {
      toast.error("Erreur lors du changement de mot de passe.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Profil personnel
        </h2>

        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623] text-xl font-bold">
              {user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">{user.full_name}</p>
              <p className="text-sm text-[#6B6B6B]">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium uppercase bg-[#F5A623]/10 text-[#F5A623] rounded-full">
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Nom complet
            </label>
            <input
              {...profileForm.register("full_name")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
            />
            {profileForm.formState.errors.full_name && (
              <p className="text-xs text-[#EF4444]">
                {profileForm.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] text-[#6B6B6B]"
            />
            <p className="text-xs text-[#6B6B6B]">
              L'email ne peut pas être modifié ici.
            </p>
          </div>

          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] disabled:opacity-50"
          >
            {profileForm.formState.isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Enregistrer
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Sécurité</h2>
        </div>

        {!changingPassword ? (
          <button
            onClick={() => setChangingPassword(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A1A1A] border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8] transition-colors"
          >
            <Key size={16} />
            Changer le mot de passe
          </button>
        ) : (
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                {...passwordForm.register("newPassword")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                placeholder="Minimum 8 caractères"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-[#EF4444]">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A1A]">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                {...passwordForm.register("confirmPassword")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                placeholder="Retapez le mot de passe"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-[#EF4444]">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false);
                  passwordForm.reset();
                }}
                className="px-4 py-2 text-sm text-[#6B6B6B] bg-[#F8F8F8] rounded-lg hover:bg-[#E5E5E5]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] disabled:opacity-50"
              >
                {passwordForm.formState.isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Key size={16} />
                )}
                Modifier
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
