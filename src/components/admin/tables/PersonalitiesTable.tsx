"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/admin/forms/ConfirmDialog";
import AIBadge from "@/components/admin/ai/AIBadge";
import type { Personality } from "@/types/database.types";

interface PersonalitiesTableProps {
  personalities: Personality[];
  categories: Array<{ id: string; name: string; slug: string; icon: string; color: string }>;
}

const columnHelper = createColumnHelper<Personality>();

export default function PersonalitiesTable({
  personalities,
  categories,
}: PersonalitiesTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [deleteTarget, setDeleteTarget] = useState<Personality | null>(null);

  const filteredData = useMemo(() => {
    let result = personalities;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.display_name?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [personalities, search, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("main_photo_url", {
        header: "",
        cell: (info) => (
          <div className="w-10 h-10 rounded-lg bg-[#F8F8F8] overflow-hidden">
            {info.getValue() ? (
              <img
                src={info.getValue()}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-xs">
                ?
              </div>
            )}
          </div>
        ),
        enableSorting: false,
        size: 50,
      }),
      columnHelper.accessor("full_name", {
        header: "Nom complet",
        cell: (info) => (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-[#1A1A1A]">{info.getValue()}</p>
              {(info.row.original as Personality & { ai_generated?: boolean }).ai_generated && (
                <AIBadge />
              )}
            </div>
            {info.row.original.title && (
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                {info.row.original.title}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Statut",
        cell: (info) => (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              info.getValue() === "published"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                info.getValue() === "published"
                  ? "bg-[#10B981]"
                  : "bg-[#F59E0B]"
              )}
            />
            {info.getValue() === "published" ? "Publié" : "Brouillon"}
          </span>
        ),
      }),
      columnHelper.accessor("views_count", {
        header: "Vues",
        cell: (info) => (
          <span className="text-[#6B6B6B]">
            {info.getValue()?.toLocaleString("fr-FR") || 0}
          </span>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Créé le",
        cell: (info) => (
          <span className="text-[#6B6B6B] text-sm">
            {new Date(info.getValue()).toLocaleDateString("fr-FR")}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Link
              href={`/personnalites/${info.row.original.slug}`}
              target="_blank"
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#1A1A1A] transition-colors"
              title="Voir"
            >
              <Eye size={15} />
            </Link>
            <Link
              href={`/admin/personalities/${info.row.original.id}/edit`}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F8F8F8] hover:text-[#F5A623] transition-colors"
              title="Modifier"
            >
              <Pencil size={15} />
            </Link>
            <button
              onClick={() => setDeleteTarget(info.row.original)}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-red-50 hover:text-[#EF4444] transition-colors"
              title="Supprimer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 20 } },
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      toast.success(`"${deleteTarget.full_name}" a été supprimé.`);
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
            placeholder="Rechercher une personnalité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#6B6B6B]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] text-[#1A1A1A]"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[#E5E5E5]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider bg-[#F8F8F8]",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none hover:text-[#1A1A1A]"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown size={13} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-16 text-center text-sm text-[#6B6B6B]"
                  >
                    {search || statusFilter !== "all"
                      ? "Aucun résultat pour ces filtres."
                      : "Aucune personnalité créée pour le moment."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F8F8F8] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
            <p className="text-sm text-[#6B6B6B]">
              {filteredData.length} personnalité(s)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-lg hover:bg-[#F8F8F8] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm text-[#6B6B6B]">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-lg hover:bg-[#F8F8F8] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer cette personnalité ?"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.full_name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}
