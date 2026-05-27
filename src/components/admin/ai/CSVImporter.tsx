"use client";

import { useState, useRef } from "react";
import { Upload, Download, X, FileText } from "lucide-react";
import { toast } from "sonner";
import type { BatchEntry } from "@/types/ai.types";

interface CSVImporterProps {
  onImport: (entries: BatchEntry[]) => void;
}

export default function CSVImporter({ onImport }: CSVImporterProps) {
  const [preview, setPreview] = useState<BatchEntry[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): BatchEntry[] => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const nameIdx = headers.findIndex(
      (h) => h === "nom" || h === "name" || h === "personnalite"
    );
    const catIdx = headers.findIndex(
      (h) => h === "categorie" || h === "category" || h === "catégorie"
    );
    const eraIdx = headers.findIndex(
      (h) => h === "epoque" || h === "era" || h === "époque"
    );
    const notesIdx = headers.findIndex(
      (h) => h === "notes" || h === "note" || h === "contexte"
    );

    if (nameIdx === -1) {
      toast.error(
        "Colonne 'nom' introuvable dans le CSV. Colonnes attendues : nom, catégorie, époque, notes"
      );
      return [];
    }

    return lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        name: cols[nameIdx] || "",
        category: catIdx >= 0 ? cols[catIdx] || "histoire" : "histoire",
        era: eraIdx >= 0 ? cols[eraIdx] || "contemporary" : "contemporary",
        notes: notesIdx >= 0 ? cols[notesIdx] : undefined,
      };
    }).filter((e) => e.name);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Seuls les fichiers CSV sont acceptés.");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const entries = parseCSV(text);
      if (entries.length === 0) {
        toast.error("Aucune entrée valide trouvée dans le CSV.");
        return;
      }
      setPreview(entries);
      toast.success(`${entries.length} personnalités détectées.`);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    onImport(preview);
    setPreview([]);
    setFileName("");
  };

  const downloadTemplate = () => {
    const csv = `nom,catégorie,époque,notes\nHassan Gouled Aptidon,politique,post_independence,Premier président\nItta Sugal,culture,contemporary,Artiste musicale\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pixmemoire_modele_batch.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F8F8F8] transition-colors"
        >
          <Upload size={16} />
          Importer un CSV
        </button>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5A623] hover:text-[#E09010]"
        >
          <Download size={16} />
          Télécharger le modèle
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
          <FileText size={14} />
          {fileName}
          <button
            onClick={() => {
              setPreview([]);
              setFileName("");
            }}
          >
            <X size={14} className="text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="max-h-60 overflow-auto rounded-lg border border-[#E5E5E5]">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F8] sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    #
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    Nom
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    Catégorie
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    Époque
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-[#6B6B6B]">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.map((entry, i) => (
                  <tr key={i} className="border-t border-[#E5E5E5]">
                    <td className="px-3 py-2 text-[#6B6B6B]">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{entry.name}</td>
                    <td className="px-3 py-2">{entry.category}</td>
                    <td className="px-3 py-2">{entry.era}</td>
                    <td className="px-3 py-2 text-[#6B6B6B]">
                      {entry.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F5A623] rounded-lg hover:bg-[#E09010]"
            >
              Confirmer l'import ({preview.length} entrées)
            </button>
            <button
              onClick={() => {
                setPreview([]);
                setFileName("");
              }}
              className="px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
