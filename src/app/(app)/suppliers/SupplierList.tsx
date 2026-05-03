"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Supplier } from "@/lib/data/suppliers";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeleton";
import ConfirmDialog from "@/components/ConfirmDialog";
import SupplierCard from "./SupplierCard";

interface SupplierListProps {
  initialData: Supplier[];
  initialTotal: number;
  canEdit: boolean;
}

export default function SupplierList({
  initialData,
  initialTotal,
  canEdit,
}: SupplierListProps) {
  const t = useTranslations("suppliers");
  const tc = useTranslations("common");
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [data, setData] = useState<Supplier[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, startTransition] = useTransition();

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"delete" | "restore">("delete");
  const [actionLoading, setActionLoading] = useState(false);

  async function fetch(opts: {
    search?: string;
    activeOnly?: boolean;
    page?: number;
  }) {
    const s = opts.search ?? search;
    const ao = opts.activeOnly ?? activeOnly;
    const p = opts.page ?? page;
    const params = new URLSearchParams({
      search: s,
      activeOnly: String(ao),
      page: String(p),
    });
    const res = await window.fetch(`/api/suppliers?${params}`);
    const json = await res.json();
    setData(json.data);
    setTotal(json.total);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    startTransition(() => {
      fetch({ search: value, page: 1 });
    });
  }

  function handleToggleActive() {
    const next = !activeOnly;
    setActiveOnly(next);
    setPage(1);
    startTransition(() => {
      fetch({ activeOnly: next, page: 1 });
    });
  }

  function handleNextPage() {
    const next = page + 1;
    setPage(next);
    startTransition(() => {
      fetch({ page: next });
    });
  }

  function handlePrevPage() {
    const prev = page - 1;
    setPage(prev);
    startTransition(() => {
      fetch({ page: prev });
    });
  }

  function openDelete(id: string) {
    setConfirmId(id);
    setConfirmAction("delete");
  }

  function openRestore(id: string) {
    setConfirmId(id);
    setConfirmAction("restore");
  }

  async function handleConfirm() {
    if (!confirmId) return;
    setActionLoading(true);
    try {
      if (confirmAction === "delete") {
        await window.fetch(`/api/suppliers/${confirmId}`, { method: "DELETE" });
        toast.success(t("deleteSuccess"));
      } else {
        await window.fetch(`/api/suppliers/${confirmId}/restore`, { method: "POST" });
        toast.success(t("restoreSuccess"));
      }
      setConfirmId(null);
      startTransition(() => {
        fetch({});
      });
    } catch {
      toast.error(tc("retry"));
    } finally {
      setActionLoading(false);
    }
  }

  const pageSize = 20;
  const hasMore = page * pageSize < total;

  return (
    <>
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={handleSearch} />
        </div>
        <button
          type="button"
          onClick={handleToggleActive}
          className={[
            "h-10 px-3 rounded-xl border text-sm font-medium transition-colors shrink-0",
            activeOnly
              ? "bg-primary-50 border-primary-300 text-primary-700"
              : "bg-white border-neutral-300 text-neutral-600",
          ].join(" ")}
        >
          {activeOnly ? tc("activeOnly") : tc("showAll")}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          message={t("empty")}
          hint={canEdit ? t("emptyHint") : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              canEdit={canEdit}
              onEdit={() => router.push(`/suppliers/${s.id}`)}
              onDelete={() => openDelete(s.id)}
              onRestore={() => openRestore(s.id)}
            />
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={handlePrevPage}
            className="h-10 px-4 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 disabled:opacity-40"
          >
            ← {tc("back")}
          </button>
          <span className="text-sm text-neutral-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
          </span>
          <button
            type="button"
            disabled={!hasMore}
            onClick={handleNextPage}
            className="h-10 px-4 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        message={confirmAction === "delete" ? t("deleteConfirm") : t("restoreConfirm")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmId(null)}
        loading={actionLoading}
        destructive={confirmAction === "delete"}
      />
    </>
  );
}
