import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import BuyerForm from "../BuyerForm";

export default async function NewBuyerPage() {
  const session = await requireSession();
  const t = await getTranslations("buyers");
  const tc = await getTranslations("common");

  if (session.role === "munim") {
    redirect("/buyers");
  }

  return (
    <PageContainer className="py-4">
      <PageHeader
        title={t("newTitle")}
        backHref="/buyers"
        backLabel={tc("back")}
      />
      <BuyerForm />
    </PageContainer>
  );
}
