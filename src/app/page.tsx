import Link from "next/link";
import { getTranslations } from "next-intl/server";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function Home() {
  const t = await getTranslations("landing");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Language switcher — top right */}
      <div className="flex justify-end px-4 pt-4">
        <LocaleSwitcher size="sm" />
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <PageContainer className="flex flex-col items-center text-center gap-6 py-8">
          <div>
            <h1 className="text-6xl font-extrabold tracking-tight text-primary-700">
              Naka
            </h1>
            <p className="mt-2 text-xl font-semibold text-neutral-700">
              {t("tagline")}
            </p>
            <p className="mt-3 text-base text-neutral-500 leading-relaxed">
              {t("subTagline")}
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full mt-2">
            <Link href="/login" className="w-full min-h-0">
              <Button variant="primary" fullWidth>
                {t("openLogbook")}
              </Button>
            </Link>
            <Link
              href="/owners"
              className="inline-flex items-center justify-center min-h-[44px] text-primary-700 font-medium underline underline-offset-4 hover:text-primary-800 transition-colors"
            >
              {t("forOwners")}
            </Link>
          </div>
        </PageContainer>
      </main>

      <footer className="py-4 text-center">
        <p className="text-sm text-neutral-400">{t("footer")}</p>
      </footer>
    </div>
  );
}
