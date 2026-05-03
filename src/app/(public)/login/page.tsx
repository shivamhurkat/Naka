"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tLanding = useTranslations("landing");

  const [millCode, setMillCode] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    millCode.length >= 4 && phone.length === 10 && pin.length === 4;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErrorKey(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mill_code: millCode.trim().toUpperCase(),
          phone: phone.trim(),
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // API returns error_key relative to 'auth' namespace
        setErrorKey(data.error_key ?? "errors.serverError");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorKey("errors.networkError");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex justify-end px-4 pt-4">
        <LocaleSwitcher size="sm" />
      </div>

      <main className="flex-1 flex flex-col justify-center">
        <PageContainer className="py-6">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary-700">
              Naka
            </h1>
            <p className="mt-1 text-neutral-500 text-sm">{tLanding("tagline")}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <label
                htmlFor="mill-code"
                className="block text-sm font-semibold text-neutral-700 mb-1.5"
              >
                {t("login.millCode")}
              </label>
              <input
                id="mill-code"
                type="text"
                value={millCode}
                onChange={(e) => setMillCode(e.target.value.toUpperCase())}
                placeholder={t("login.millCodePlaceholder")}
                maxLength={10}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-base font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent min-h-[52px]"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-neutral-700 mb-1.5"
              >
                {t("login.phone")}
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder={t("login.phonePlaceholder")}
                maxLength={10}
                autoComplete="tel"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-base focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent min-h-[52px]"
              />
            </div>

            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-semibold text-neutral-700 mb-1.5"
              >
                {t("login.pin")}
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder={t("login.pinPlaceholder")}
                maxLength={4}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-2xl text-center tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent min-h-[52px]"
              />
            </div>

            {errorKey && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-red-700 text-sm font-medium">{t(errorKey)}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!canSubmit || loading}
              className="mt-1 text-lg py-4"
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>
        </PageContainer>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-neutral-400">{tLanding("footer")}</p>
      </footer>
    </div>
  );
}
