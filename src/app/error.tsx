"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <div>
        <p className="text-5xl">⚠️</p>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-800">
          {t("errorTitle")}
        </h1>
        <p className="mt-2 text-neutral-500">{t("errorDesc")}</p>
      </div>
      <Button variant="primary" onClick={reset}>
        {t("tryAgain")}
      </Button>
    </PageContainer>
  );
}
