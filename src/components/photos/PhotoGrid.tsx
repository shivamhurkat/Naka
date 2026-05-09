"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import PhotoSlot from "./PhotoSlot";
import type { PhotoRecord } from "./PhotoSlot";
import type { PhotoSlot as SlotType } from "@/lib/storage/photos";

interface SlotConfig {
  slot: SlotType;
  labelKey: string;
}

const LOT_SLOTS: SlotConfig[] = [
  { slot: "truck", labelKey: "slotTruck" },
  { slot: "weighbridge", labelKey: "slotWeighbridge" },
  { slot: "moisture_meter", labelKey: "slotMoistureMeter" },
  { slot: "sample", labelKey: "slotSample" },
];

interface PhotoGridProps {
  entityType: string;
  entityId: string;
  slots?: SlotConfig[];
  canDelete?: boolean;
}

export default function PhotoGrid({
  entityType,
  entityId,
  slots = LOT_SLOTS,
  canDelete = false,
}: PhotoGridProps) {
  const t = useTranslations("photos");
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/photos?entity_type=${entityType}&entity_id=${entityId}`);
      if (!res.ok) return;
      const data = await res.json();
      setPhotos(
        (data as Array<{ id: string; slot: SlotType; storage_path: string; view_url: string | null }>).map((p) => ({
          id: p.id,
          slot: p.slot,
          storage_path: p.storage_path,
          view_url: p.view_url,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handlePhotoChange = useCallback(
    (slot: SlotType, photo: PhotoRecord | null) => {
      setPhotos((prev) => {
        const next = prev.filter((p) => p.slot !== slot);
        if (photo) next.push(photo);
        return next;
      });
    },
    []
  );

  const activeCount = photos.length;
  const total = slots.length;

  const badgeColor =
    activeCount === total
      ? "bg-green-100 text-green-700"
      : activeCount > 0
      ? "bg-amber-100 text-amber-700"
      : "bg-neutral-100 text-neutral-500";

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">{t("title")}</span>
          <div className="w-16 h-5 rounded-full bg-neutral-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {slots.map(({ slot }) => (
            <div key={slot} className="aspect-square rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">{t("title")}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {t("count", { count: activeCount, total })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {slots.map(({ slot, labelKey }) => {
          const existing = photos.find((p) => p.slot === slot);
          return (
            <PhotoSlot
              key={slot}
              entityType={entityType}
              entityId={entityId}
              slot={slot}
              label={t(labelKey as Parameters<typeof t>[0])}
              existingPhoto={existing}
              canDelete={canDelete}
              onPhotoChange={(photo) => handlePhotoChange(slot, photo)}
            />
          );
        })}
      </div>
    </div>
  );
}
