"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Info } from "lucide-react";
import { toast } from "sonner";

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  full_name: z.string().min(1, "Le nom est requis"),
  role: z.enum(["editor", "contributor"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteModal({ open, onClose }: InviteModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "editor" },
  });

  if (!open) return null;

  const onSubmit = async (data: InviteFormData) => {
    toast.info(
      `Pour inviter ${data.full_name}, créez d'abord le compte dans Supabase Dashboard > Authentication > Users, puis exécutez l'insertion SQL dans admin_users.`,
      { duration: 8000 }
    );

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            Inviter un administrateur
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#3B82F6]/5 border border-[#3B82F6]/20 mb-4">
          <Info size={16} className="text-[#3B82F6] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#3B82F6]">
            Le compte doit d'abord être créé dans le dashboard Supabase
            (Authentication &gt; Users). Ensuite, l'utilisateur sera ajouté ici
            avec le rôle sélectionné.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              placeholder="admin@pixel-nomade.com"
            />
            {errors.email && (
              <p className="text-xs text-[#EF4444]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Nom complet
            </label>
            <input
              {...register("full_name")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
              placeholder="Prénom Nom"
            />
            {errors.full_name && (
              <p className="text-xs text-[#EF4444]">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Rôle</label>
            <select
              {...register("role")}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
            >
              <option value="editor">Éditeur</option>
              <option value="contributor">Contributeur</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B6B6B] bg-[#F8F8F8] rounded-lg hover:bg-[#E5E5E5]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010] disabled:opacity-50"
            >
              Inviter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
