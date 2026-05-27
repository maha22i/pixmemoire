"use client";

import { Bot, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/ai.types";

interface AIBadgeProps {
  verificationStatus?: VerificationStatus;
  size?: "sm" | "md";
}

export default function AIBadge({
  verificationStatus = "unverified",
  size = "sm",
}: AIBadgeProps) {
  const isVerified = verificationStatus === "verified";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        isVerified
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-purple-50 text-purple-700 border border-purple-200"
      )}
    >
      {isVerified ? (
        <CheckCircle2 size={size === "sm" ? 12 : 14} />
      ) : (
        <Bot size={size === "sm" ? 12 : 14} />
      )}
      {isVerified ? "IA vérifiée" : "Généré par IA"}
    </span>
  );
}
