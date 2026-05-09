"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import type { InboundLotWithRefs } from "@/lib/data/inbound-lots";
import type { Session } from "@/lib/auth/session";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import LotForm from "../LotForm";

interface LotDetailViewProps {
  lot: InboundLotWithRefs;
  session: Pick<Session, "role" | "user_id">;
}

function formatInr(val: number): string {
  return val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isWithin24h(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

export default function LotDetailView({ lot, session }: LotDetailViewProps) {
  const t = useTranslations("lots");
  const tc = useTranslations("common");
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canEdit =
    session.role === "owner" ||
    session.role === "manager" ||
    (session.role === "munim" &&
      lot.created_by === session.user_id &&
      isWithin24h(lot.created_at));

  const canDelete = session.role === "owner";

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/lots/${lot.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(tc("retry"));
        return;
      }
      toast.success(t("deleted"));
      router.push("/lots");
      router.refresh();
    } catch {
      toast.error(tc("retry"));
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return <LotForm initial={lot} />;
  }

  const fields = [
    { label: t("lotNumber"), value: lot.lot_number, mono: true },
    { label: t("supplier"), value: lot.supplier_name },
    { label: t("item"), value: lot.item_name },
    { label: t("vehicleNumber"), value: lot.vehicle_number ?? "—" },
    { label: t("grossWeight"), value: `${lot.gross_weight_qtl.toLocaleString("en-IN", { maximumFractionDigits: 3 })} qtl` },
    { label: t("tareWeight"), value: `${lot.tare_weight_qtl.toLocaleString("en-IN", { maximumFractionDigits: 3 })} qtl` },
    { label: t("netWeight"), value: `${lot.net_weight_qtl.toLocaleString("en-IN", { maximumFractionDigits: 3 })} qtl`, highlight: true },
    { label: t("moisture"), value: lot.moisture_pct != null ? `${lot.moisture_pct}%` : "—" },
    { label: t("ratePerQtl"), value: `₹ ${formatInr(lot.rate_per_qtl)}` },
    { label: t("deduction"), value: `₹ ${formatInr(lot.deduction_amount)}` },
    { label: t("totalAmount"), value: `₹ ${formatInr(lot.total_amount)}` },
    { label: t("payableAmount"), value: `₹ ${formatInr(lot.payable_amount)}`, highlight: true },
    { label: t("receivedAt"), value: formatDate(lot.received_at) },
  ];

  if (lot.notes) fields.push({ label: tc("notes"), value: lot.notes });

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Card>
        <div className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">{f.label}</p>
              <p
                className={[
                  "text-base",
                  f.mono ? "font-mono font-bold text-neutral-900" : "",
                  f.highlight ? "font-bold text-primary-700" : "text-neutral-900",
                ].join(" ")}
              >
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Photos placeholder */}
      <Card>
        <div className="flex flex-col items-center gap-2 py-4">
          <Camera size={28} className="text-neutral-300" />
          <p className="text-sm text-neutral-400">{t("photosComingSoon")}</p>
          <button
            type="button"
            disabled
            className="h-9 px-4 rounded-xl bg-neutral-100 text-neutral-400 text-sm font-medium cursor-not-allowed"
          >
            + Photo
          </button>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {canEdit && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setEditing(true)}
          >
            {tc("edit")}
          </Button>
        )}
        {!canEdit && session.role === "munim" && (
          <p className="text-xs text-neutral-400 self-center">{t("munimEditExpired")}</p>
        )}
        {canDelete && (
          <>
            <Button
              variant="ghost"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={deleting}
              onClick={() => setConfirmOpen(true)}
            >
              {deleting ? tc("deleting") : tc("delete")}
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              message={t("deleteConfirm")}
              onConfirm={handleDelete}
              onCancel={() => setConfirmOpen(false)}
              loading={deleting}
              destructive
            />
          </>
        )}
      </div>
    </div>
  );
}
