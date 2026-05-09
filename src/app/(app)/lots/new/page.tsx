import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/session";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import LotForm from "../LotForm";

export default async function NewLotPage() {
  await requireSession();
  const t = await getTranslations("lots");

  return (
    <PageContainer className="py-4">
      <PageHeader title={t("addTitle")} backHref="/lots" />
      <LotForm />
    </PageContainer>
  );
}
