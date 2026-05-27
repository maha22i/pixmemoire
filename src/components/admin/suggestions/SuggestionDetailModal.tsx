"use client";

import { X, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Suggestion {
  id: string;
  type: string;
  personality_id: string | null;
  submitter_name: string;
  submitter_email: string;
  message: string;
  status: string;
  created_at: string;
}

interface SuggestionDetailModalProps {
  suggestion: Suggestion | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function SuggestionDetailModal({
  suggestion,
  open,
  onClose,
  onStatusChange,
}: SuggestionDetailModalProps) {
  if (!open || !suggestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Détail de la suggestion
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F8F8F8] text-[#6B6B6B]">
              {suggestion.type === "new_personality"
                ? "Nouvelle personnalité"
                : "Correction"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#6B6B6B] mb-0.5">Contributeur</p>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {suggestion.submitter_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6B6B6B] mb-0.5">Email</p>
              <p className="text-sm text-[#1A1A1A]">
                {suggestion.submitter_email}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#6B6B6B] mb-0.5">Date</p>
            <p className="text-sm text-[#1A1A1A]">
              {new Date(suggestion.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#6B6B6B] mb-1">Message</p>
            <div className="p-4 rounded-lg bg-[#F8F8F8] text-sm text-[#1A1A1A] whitespace-pre-wrap">
              {suggestion.message}
            </div>
          </div>

          {suggestion.personality_id && (
            <Link
              href={`/admin/personalities/${suggestion.personality_id}/edit`}
              className="flex items-center gap-2 text-sm text-[#F5A623] hover:text-[#E09010]"
            >
              <ExternalLink size={14} />
              Voir la personnalité concernée
            </Link>
          )}
        </div>

        {suggestion.status === "pending" && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E5E5E5]">
            <button
              onClick={() => onStatusChange(suggestion.id, "rejected")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#EF4444] bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle size={16} />
              Refuser
            </button>
            {suggestion.type === "new_personality" ? (
              <Link
                href="/admin/personalities/new"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#10B981] rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle size={16} />
                Créer la fiche
              </Link>
            ) : (
              <button
                onClick={() => onStatusChange(suggestion.id, "accepted")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#10B981] rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle size={16} />
                Accepter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
