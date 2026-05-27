"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  maxSize?: number;
  accept?: string;
  label?: string;
  error?: string;
}

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  folder = "portraits",
  maxSize = 5 * 1024 * 1024,
  accept = "image/jpeg,image/png,image/webp",
  label = "Photo",
  error,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (file.size > maxSize) {
        setUploadError(`Le fichier dépasse la taille maximale de ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      if (!accept.split(",").some((type) => file.type === type.trim())) {
        setUploadError("Format non supporté. Utilisez JPEG, PNG ou WebP.");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload");
        }

        const data = await response.json();
        onChange(data.url);
      } catch {
        setUploadError("Erreur lors de l'upload. Veuillez réessayer.");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSize, accept, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const displayError = error || uploadError;

  if (value) {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
        )}
        <div className="relative inline-block rounded-xl overflow-hidden border border-[#E5E5E5]">
          <Image
            src={value}
            alt="Aperçu"
            width={200}
            height={200}
            className="w-48 h-48 object-cover"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <X size={14} className="text-[#EF4444]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
          isDragging
            ? "border-[#F5A623] bg-[#F5A623]/5"
            : "border-[#E5E5E5] hover:border-[#F5A623]/50 hover:bg-[#F8F8F8]",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        {isUploading ? (
          <>
            <div className="w-10 h-10 border-3 border-[#E5E5E5] border-t-[#F5A623] rounded-full animate-spin" />
            <p className="text-sm text-[#6B6B6B]">Upload en cours...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#F5A623]/10 flex items-center justify-center">
              {isDragging ? (
                <ImageIcon size={24} className="text-[#F5A623]" />
              ) : (
                <Upload size={24} className="text-[#F5A623]" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#1A1A1A]">
                Glissez-déposez une image ici
              </p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                ou cliquez pour parcourir (JPEG, PNG, WebP — max {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {displayError && <p className="text-xs text-[#EF4444]">{displayError}</p>}
    </div>
  );
}
