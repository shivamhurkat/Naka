import Link from "next/link";
import { getTranslations } from "next-intl/server";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <div>
        <p className="text-6xl font-bold text-primary-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-800">
          {t("notFound")}
        </h1>
        <p className="mt-2 text-neutral-500">{t("notFoundDesc")}</p>
      </div>
      <Link href="/">
        <Button variant="primary">{t("goHome")}</Button>
      </Link>
    </PageContainer>
  );
}
