"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  label?: string;
  error?: string;
}

export default function TagsInput({
  value,
  onChange,
  placeholder = "Ajouter un tag...",
  maxTags = 20,
  label,
  error,
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex flex-wrap items-center gap-1.5 p-2 rounded-lg border bg-white cursor-text transition-colors",
          "focus-within:ring-2 focus-within:ring-[#F5A623]/30 focus-within:border-[#F5A623]",
          error ? "border-[#EF4444]" : "border-[#E5E5E5]"
        )}
      >
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5A623]/10 text-[#F5A623] text-xs font-medium rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-[#E09010] transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input && addTag(input)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-[#1A1A1A] placeholder:text-[#6B6B6B]/50"
          />
        )}
      </div>
      <div className="flex justify-between">
        {error ? (
          <p className="text-xs text-[#EF4444]">{error}</p>
        ) : (
          <p className="text-xs text-[#6B6B6B]">
            Appuyez sur Entrée ou virgule pour ajouter
          </p>
        )}
        <p className="text-xs text-[#6B6B6B]">
          {value.length}/{maxTags}
        </p>
      </div>
    </div>
  );
}
