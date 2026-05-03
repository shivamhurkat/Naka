"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const LOCALES = [
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
] as const;

interface LocaleSwitcherProps {
  /** "sm" renders compact version for public pages */
  size?: "sm" | "md";
}

export default function LocaleSwitcher({ size = "md" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function switchLocale(next: string) {
    if (next === locale) return;

    // Write cookie client-side for instant feedback
    const maxAge = 30 * 24 * 60 * 60;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `naka_locale=${next}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

    // Persist to DB (non-blocking; silently ignored on public pages)
    fetch("/api/user/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).catch(() => {});

    startTransition(() => {
      router.refresh();
    });
  }

  const base =
    size === "sm"
      ? "px-2 py-1 text-xs rounded-lg min-h-[32px]"
      : "px-3 py-1.5 text-sm rounded-xl min-h-[36px]";

  return (
    <div
      className="flex items-center gap-0.5 bg-neutral-100 rounded-xl p-0.5"
      aria-label="Language switcher"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={isPending}
          aria-pressed={locale === code}
          className={[
            base,
            "font-medium transition-colors duration-150",
            locale === code
              ? "bg-white text-primary-700 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
