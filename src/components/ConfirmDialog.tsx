"use client";

import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}: ConfirmDialogProps) {
  const t = useTranslations("common");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-base text-neutral-800 mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-neutral-300 text-neutral-700 font-medium text-base disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "flex-1 h-11 rounded-xl font-medium text-base text-white disabled:opacity-50",
              destructive ? "bg-red-600 active:bg-red-700" : "bg-primary-600 active:bg-primary-700",
            ].join(" ")}
          >
            {loading ? t("deleting") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
