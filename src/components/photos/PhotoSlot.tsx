"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, CheckCircle, X, RefreshCw } from "lucide-react";
import imageCompression from "browser-image-compression";
import type { PhotoSlot as SlotType } from "@/lib/storage/photos";

export interface PhotoRecord {
  id: string;
  slot: SlotType;
  storage_path: string;
  view_url: string | null;
}

interface PhotoSlotProps {
  entityType: string;
  entityId: string;
  slot: SlotType;
  label: string;
  existingPhoto?: PhotoRecord;
  canDelete?: boolean;
  onPhotoChange: (photo: PhotoRecord | null) => void;
}

type UploadState = "idle" | "compressing" | "uploading" | "error";

export default function PhotoSlot({
  entityType,
  entityId,
  slot,
  label,
  existingPhoto,
  canDelete = false,
  onPhotoChange,
}: PhotoSlotProps) {
  const t = useTranslations("photos");
  const tc = useTranslations("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

  const triggerPick = () => fileInputRef.current?.click();

  const upload = useCallback(
    async (file: File) => {
      setUploadState("compressing");
      setProgress(0);
      try {
        // Compress client-side
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/jpeg",
        });

        // Get signed upload URL
        setUploadState("uploading");
        const urlRes = await fetch("/api/photos/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entityId,
            slot,
            mime_type: "image/jpeg",
          }),
        });
        if (!urlRes.ok) throw new Error("url-failed");
        const { url, path } = await urlRes.json();

        // PUT with XHR for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("put-failed")));
          xhr.onerror = () => reject(new Error("network"));
          xhr.open("PUT", url);
          xhr.setRequestHeader("Content-Type", "image/jpeg");
          xhr.send(compressed);
        });

        // Register photo
        const regRes = await fetch("/api/photos/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entityId,
            slot,
            storage_path: path,
            mime_type: "image/jpeg",
            file_size_bytes: String(compressed.size),
          }),
        });
        if (!regRes.ok) throw new Error("register-failed");
        const { photo, view_url } = await regRes.json();

        onPhotoChange({ id: photo.id, slot: photo.slot, storage_path: photo.storage_path, view_url });
        setPendingFile(null);
        setUploadState("idle");
        setProgress(0);
        toast.success(t("photoSaved"));
      } catch {
        setUploadState("error");
      }
    },
    [entityType, entityId, slot, onPhotoChange, t]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setPendingFile(file);
    upload(file);
  };

  const handleRetry = () => {
    if (pendingFile) upload(pendingFile);
  };

  const handleDelete = async () => {
    if (!existingPhoto) return;
    setShowDeleteConfirm(false);
    try {
      const res = await fetch(`/api/photos/${existingPhoto.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onPhotoChange(null);
      toast.success(t("photoDeleted"));
    } catch {
      toast.error(tc("retry"));
    }
  };

  const handlePointerDown = () => {
    if (!canDelete || !existingPhoto) return;
    longPressTimer.current = setTimeout(() => setShowDeleteConfirm(true), 600);
  };

  const handlePointerUp = () => clearTimeout(longPressTimer.current);

  const isUploading = uploadState === "compressing" || uploadState === "uploading";
  const hasPhoto = !!existingPhoto && uploadState === "idle";
  const hasError = uploadState === "error";

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-500 text-center">{label}</span>
        <div
          className={[
            "relative aspect-square rounded-xl overflow-hidden border-2 flex items-center justify-center cursor-pointer select-none",
            hasError ? "border-red-400 bg-red-50" : hasPhoto ? "border-green-400 bg-neutral-100" : "border-dashed border-neutral-300 bg-neutral-50",
            isUploading ? "cursor-not-allowed" : "active:opacity-80",
          ].join(" ")}
          onClick={!isUploading ? triggerPick : undefined}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Filled state */}
          {hasPhoto && existingPhoto.view_url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingPhoto.view_url}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
              />
              <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                <CheckCircle size={14} className="text-green-500" />
              </div>
            </>
          )}

          {/* Empty state */}
          {!hasPhoto && !isUploading && !hasError && (
            <div className="flex flex-col items-center gap-1 p-2">
              <Camera size={22} className="text-neutral-300" />
            </div>
          )}

          {/* Uploading state: show compressed preview + progress */}
          {isUploading && pendingFile && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(pendingFile)}
                alt="preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-neutral-200">
                <div
                  className="h-full bg-primary-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow">
                {progress}%
              </p>
            </>
          )}

          {/* Error state */}
          {hasError && (
            <div
              className="flex flex-col items-center gap-1 p-2"
              onClick={(e) => { e.stopPropagation(); handleRetry(); }}
            >
              <RefreshCw size={18} className="text-red-400" />
              <span className="text-xs text-red-500 text-center">{t("retry")}</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {/* Fullscreen modal */}
      {fullscreen && existingPhoto?.view_url && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingPhoto.view_url}
            alt={label}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 bg-white/20 rounded-full p-2 text-white"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-safe">
          <div className="bg-white w-full max-w-sm rounded-t-2xl p-6 flex flex-col gap-4">
            <p className="text-base font-medium text-neutral-800 text-center">{t("deleteConfirm")}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 rounded-xl border border-neutral-300 text-neutral-700 font-medium"
              >
                {tc("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white font-medium"
              >
                {t("deletePhoto")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
