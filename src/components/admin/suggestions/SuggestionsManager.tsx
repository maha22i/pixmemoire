"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import SuggestionDetailModal from "./SuggestionDetailModal";

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

interface SuggestionsManagerProps {
  initialSuggestions: Suggestion[];
}

const TABS = [
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Acceptées" },
  { key: "rejected", label: "Refusées" },
  { key: "all", label: "Toutes" },
];

export default function SuggestionsManager({
  initialSuggestions,
}: SuggestionsManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  const filteredSuggestions =
    activeTab === "all"
      ? initialSuggestions
      : initialSuggestions.filter((s) => s.status === activeTab);

  const getCounts = (tab: string) =>
    tab === "all"
      ? initialSuggestions.length
      : initialSuggestions.filter((s) => s.status === tab).length;

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("suggestions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success(
        status === "accepted"
          ? "Suggestion acceptée."
          : status === "rejected"
            ? "Suggestion refusée."
            : "Suggestion mise à jour."
      );

      setSelectedSuggestion(null);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  return (
    <>
      <div className="flex gap-1 border-b border-[#E5E5E5]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-[#F5A623] text-[#F5A623]"
                : "border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]"
            )}
          >
            {tab.label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#F8F8F8] text-xs">
              {getCounts(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
          <p className="text-sm text-[#6B6B6B]">
            Aucune suggestion dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                  Contributeur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase bg-[#F8F8F8]">
                  Statut
                </th>
                <th className="px-4 py-3 bg-[#F8F8F8]" />
              </tr>
            </thead>
            <tbody>
              {filteredSuggestions.map((suggestion) => (
                <tr
                  key={suggestion.id}
                  className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F8F8F8] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F8F8F8] text-[#6B6B6B]">
                      {suggestion.type === "new_personality"
                        ? "Nouvelle"
                        : "Correction"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {suggestion.submitter_name}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">
                      {suggestion.submitter_email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#6B6B6B] truncate max-w-[300px]">
                      {suggestion.message}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B6B6B]">
                    {formatDistanceToNow(new Date(suggestion.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={suggestion.status as "pending" | "accepted" | "rejected"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedSuggestion(suggestion)}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#1A1A1A]"
                        title="Voir les détails"
                      >
                        <Eye size={15} />
                      </button>
                      {suggestion.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(suggestion.id, "accepted")
                            }
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-emerald-50 hover:text-[#10B981]"
                            title="Accepter"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(suggestion.id, "rejected")
                            }
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444]"
                            title="Refuser"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SuggestionDetailModal
        suggestion={selectedSuggestion}
        open={!!selectedSuggestion}
        onClose={() => setSelectedSuggestion(null)}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
