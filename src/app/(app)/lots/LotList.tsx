"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Link from "next/link";
import LotCard from "./LotCard";
import EmptyState from "@/components/EmptyState";
import type { InboundLotWithRefs } from "@/lib/data/inbound-lots";

interface LotListProps {
  initialData: InboundLotWithRefs[];
  initialTotal: number;
}

type Filter = "today" | "week" | "all";

function getDateRange(filter: Filter): { date_from?: string; date_to?: string } {
  const now = new Date();
  if (filter === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { date_from: start.toISOString() };
  }
  if (filter === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { date_from: start.toISOString() };
  }
  return {};
}

export default function LotList({ initialData, initialTotal }: LotListProps) {
  const t = useTranslations("lots");

  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(false);

  const fetchLots = useCallback(
    async (q: string, f: Filter) => {
      setLoading(true);
      const params = new URLSearchParams({ query: q, pageSize: "50" });
      const range = getDateRange(f);
      if (range.date_from) params.set("date_from", range.date_from);
      if (range.date_to) params.set("date_to", range.date_to);
      try {
        const res = await fetch(`/api/lots?${params}`);
        const json = await res.json();
        setData(json.data ?? []);
        setTotal(json.total ?? 0);
      } catch {
        // keep existing
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (query || filter !== "all") {
      const t = setTimeout(() => fetchLots(query, filter), 300);
      return () => clearTimeout(t);
    }
  }, [query, filter, fetchLots]);

  const filters: { key: Filter; label: string }[] = [
    { key: "today", label: t("filterToday") },
    { key: "week", label: t("filterWeek") },
    { key: "all", label: t("filterAll") },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search")}
        className="h-11 rounded-xl border border-neutral-300 px-3 text-base placeholder:text-neutral-400 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

      {/* Date filter chips */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              filter === f.key
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-300 hover:border-primary-400",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-neutral-400 self-center">{total} lots</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <EmptyState message={t("empty")} hint={t("emptyHint")} />
          <Link
            href="/lots/new"
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary-600 text-white text-sm font-medium"
          >
            <Plus size={16} />
            {t("addNew")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  );
}
