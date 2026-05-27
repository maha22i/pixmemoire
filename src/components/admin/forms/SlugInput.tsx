"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  sourceValue?: string;
  disabled?: boolean;
  error?: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SlugInput({
  value,
  onChange,
  sourceValue,
  disabled = false,
  error,
}: SlugInputProps) {
  const [autoGenerate, setAutoGenerate] = useState(!value);

  useEffect(() => {
    if (autoGenerate && sourceValue) {
      onChange(generateSlug(sourceValue));
    }
  }, [sourceValue, autoGenerate, onChange]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[#1A1A1A]">Slug</label>
        <button
          type="button"
          onClick={() => setAutoGenerate(!autoGenerate)}
          className={cn(
            "text-xs px-2 py-0.5 rounded-full transition-colors",
            autoGenerate
              ? "bg-[#F5A623]/10 text-[#F5A623]"
              : "bg-[#F8F8F8] text-[#6B6B6B] hover:text-[#1A1A1A]"
          )}
        >
          {autoGenerate ? "Auto" : "Manuel"}
        </button>
      </div>
      <div className="relative">
        <Link2
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setAutoGenerate(false);
            onChange(generateSlug(e.target.value));
          }}
          disabled={disabled || autoGenerate}
          placeholder="slug-genere-automatiquement"
          className={cn(
            "w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]",
            disabled || autoGenerate
              ? "bg-[#F8F8F8] text-[#6B6B6B] border-[#E5E5E5]"
              : "bg-white text-[#1A1A1A] border-[#E5E5E5]",
            error && "border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]"
          )}
        />
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}
