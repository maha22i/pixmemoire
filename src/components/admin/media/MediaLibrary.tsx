"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Search,
  Trash2,
  Download,
  Filter,
  Image as ImageIcon,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/admin/forms/ConfirmDialog";

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  folder: string;
  created_at: string;
  alt_text: string;
}

interface MediaLibraryProps {
  initialMedia: MediaItem[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ initialMedia }: MediaLibraryProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredMedia = initialMedia.filter((item) => {
    const matchesSearch =
      !search ||
      item.original_name.toLowerCase().includes(search.toLowerCase()) ||
      item.filename.toLowerCase().includes(search.toLowerCase());
    const matchesFolder =
      folderFilter === "all" || item.folder === folderFilter;
    return matchesSearch && matchesFolder;
  });

  const totalSize = initialMedia.reduce((sum, m) => sum + m.file_size, 0);

  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    let successCount = 0;

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "general");

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) successCount++;
      } catch {
        // erreurs individuelles ignorées
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} fichier(s) uploadé(s) avec succès.`);
      router.refresh();
    } else {
      toast.error("Erreur lors de l'upload.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const supabase = createClient();

      await supabase.storage.from("media").remove([deleteTarget.filename]);
      await supabase.from("media_library").delete().eq("id", deleteTarget.id);

      toast.success("Fichier supprimé.");
      setDeleteTarget(null);
      setSelectedItem(null);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          />
          <input
            type="text"
            placeholder="Rechercher un fichier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#6B6B6B]" />
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
          >
            <option value="all">Tous les dossiers</option>
            <option value="portraits">Portraits</option>
            <option value="gallery">Galerie</option>
            <option value="documents">Documents</option>
            <option value="general">Général</option>
          </select>
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-[#F5A623] text-white text-sm font-medium rounded-lg hover:bg-[#E09010] transition-colors disabled:opacity-50"
        >
          <Upload size={16} />
          {isUploading ? "Upload..." : "Uploader"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />

        <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] ml-auto">
          <HardDrive size={14} />
          {formatFileSize(totalSize)} utilisés • {initialMedia.length} fichier(s)
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F8F8F8] flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-[#6B6B6B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
            {search || folderFilter !== "all"
              ? "Aucun résultat"
              : "Médiathèque vide"}
          </h3>
          <p className="text-sm text-[#6B6B6B]">
            {search || folderFilter !== "all"
              ? "Essayez de modifier vos filtres."
              : "Uploadez votre premier fichier pour commencer."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-sm",
                selectedItem?.id === item.id
                  ? "border-[#F5A623] ring-2 ring-[#F5A623]/30"
                  : "border-[#E5E5E5]"
              )}
            >
              <div className="aspect-square bg-[#F8F8F8] relative">
                {item.mime_type.startsWith("image/") ? (
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-[#6B6B6B]" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-[#1A1A1A] truncate">
                  {item.original_name}
                </p>
                <p className="text-[10px] text-[#6B6B6B]">
                  {formatFileSize(item.file_size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t border-[#E5E5E5] p-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F8F8F8]">
              <img
                src={selectedItem.file_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {selectedItem.original_name}
              </p>
              <p className="text-xs text-[#6B6B6B]">
                {formatFileSize(selectedItem.file_size)} • {selectedItem.folder}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={selectedItem.file_url}
              download
              target="_blank"
              className="p-2 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#1A1A1A]"
            >
              <Download size={16} />
            </a>
            <button
              onClick={() => setDeleteTarget(selectedItem)}
              className="p-2 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444]"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedItem.file_url);
                toast.success("URL copiée dans le presse-papier.");
              }}
              className="px-3 py-1.5 text-sm text-[#F5A623] border border-[#F5A623] rounded-lg hover:bg-[#F5A623]/5"
            >
              Copier l'URL
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer ce fichier ?"
        description="Êtes-vous sûr ? Le fichier sera supprimé définitivement du stockage."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}
