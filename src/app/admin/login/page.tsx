"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login")) {
          setServerError("Identifiants incorrects. Veuillez réessayer.");
        } else if (error.message.includes("Email not confirmed")) {
          setServerError("Votre email n'a pas encore été confirmé.");
        } else {
          setServerError(
            error.message || "Une erreur est survenue. Veuillez réessayer."
          );
        }
        return;
      }

      toast.success("Connexion réussie !");
      router.push("/admin");
      router.refresh();
    } catch {
      setServerError("Erreur de connexion au serveur. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F5A623] mb-4">
            <span className="text-white font-bold text-xl">PM</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">PixMémoire</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Espace Administration
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Connexion
          </h2>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-[#EF4444]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#1A1A1A]"
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@pixel-nomade.com"
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all placeholder:text-[#6B6B6B]/40"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[#EF4444]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#1A1A1A]"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all placeholder:text-[#6B6B6B]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#EF4444]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-[#6B6B6B] hover:text-[#F5A623] transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5A623] text-white font-semibold rounded-lg hover:bg-[#E09010] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#6B6B6B] mt-6">
          Pixel Nomade &copy; {new Date().getFullYear()} — PixMémoire
        </p>
      </div>
    </div>
  );
}
