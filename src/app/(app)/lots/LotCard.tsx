import Link from "next/link";
import { Camera } from "lucide-react";
import type { InboundLotWithRefs } from "@/lib/data/inbound-lots";

interface LotCardProps {
  lot: InboundLotWithRefs;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  const m = Math.floor(diff / 60_000);
  return m <= 1 ? "Just now" : `${m}m ago`;
}

function formatInr(val: number): string {
  return val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function photoBadgeClass(count: number): string {
  if (count >= 4) return "text-green-500";
  if (count >= 1) return "text-amber-400";
  return "text-neutral-300";
}

export default function LotCard({ lot }: LotCardProps) {
  const count = lot.photo_count ?? 0;

  return (
    <Link
      href={`/lots/${lot.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-primary-300 active:bg-primary-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base font-bold text-neutral-900 font-mono">{lot.lot_number}</span>
            <span className="text-xs text-neutral-400">{relativeTime(lot.received_at)}</span>
          </div>
          <p className="text-sm text-neutral-700 truncate">{lot.supplier_name}</p>
          <p className="text-xs text-neutral-400 truncate">{lot.item_name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-neutral-800">
            {lot.net_weight_qtl.toLocaleString("en-IN", { maximumFractionDigits: 2 })} qtl
          </p>
          <p className="text-base font-bold text-primary-700">₹{formatInr(lot.payable_amount)}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <Camera size={14} className={photoBadgeClass(count)} />
            {count > 0 && (
              <span className={`text-xs font-medium ${photoBadgeClass(count)}`}>{count}/4</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
