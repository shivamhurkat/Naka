"use client";

import { useTranslations } from "next-intl";
import { Phone, MapPin, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { Buyer } from "@/lib/data/buyers";

interface BuyerCardProps {
  buyer: Buyer;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

export default function BuyerCard({
  buyer,
  canEdit,
  onEdit,
  onDelete,
  onRestore,
}: BuyerCardProps) {
  const tc = useTranslations("common");

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-neutral-900 truncate">{buyer.name}</p>
            {!buyer.is_active && (
              <span className="shrink-0 text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                {tc("inactive")}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {buyer.phone && (
              <span className="flex items-center gap-1 text-sm text-neutral-500">
                <Phone size={12} />
                {buyer.phone}
              </span>
            )}
            {buyer.city && (
              <span className="flex items-center gap-1 text-sm text-neutral-500">
                <MapPin size={12} />
                {buyer.city}
              </span>
            )}
          </div>
          {buyer.gst_number && (
            <p className="mt-1 text-xs text-neutral-400 font-mono">{buyer.gst_number}</p>
          )}
          {buyer.notes && (
            <p className="mt-1 text-xs text-neutral-400 line-clamp-1">{buyer.notes}</p>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={onEdit}
              aria-label={tc("edit")}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
            >
              <Pencil size={16} />
            </button>
            {buyer.is_active ? (
              <button
                type="button"
                onClick={onDelete}
                aria-label={tc("delete")}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onRestore}
                aria-label={tc("restore")}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-primary-600 hover:bg-primary-50"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
