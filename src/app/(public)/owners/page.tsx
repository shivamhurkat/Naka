import { getTranslations } from "next-intl/server";
import PageContainer from "@/components/PageContainer";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function OwnersPage() {
  const t = await getTranslations("owners");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex justify-end px-4 pt-4">
        <LocaleSwitcher size="sm" />
      </div>
      <PageContainer className="flex flex-col items-center justify-center flex-1 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">{t("title")}</h1>
        <p className="mt-2 text-neutral-500">{t("description")}</p>
      </PageContainer>
    </div>
  );
}
