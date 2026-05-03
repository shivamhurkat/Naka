import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import SupplierForm from "../SupplierForm";

export default async function NewSupplierPage() {
  const session = await requireSession();
  const t = await getTranslations("suppliers");
  const tc = await getTranslations("common");

  if (session.role === "munim") {
    redirect("/suppliers");
  }

  return (
    <PageContainer className="py-4">
      <PageHeader
        title={t("newTitle")}
        backHref="/suppliers"
        backLabel={tc("back")}
      />
      <SupplierForm />
    </PageContainer>
  );
}
