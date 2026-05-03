import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getSupplier } from "@/lib/data/suppliers";
import { NotFoundError } from "@/lib/errors";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import SupplierForm from "../SupplierForm";
import SupplierDetailView from "./SupplierDetailView";

export default async function SupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireSession();
  const t = await getTranslations("suppliers");
  const tc = await getTranslations("common");

  let supplier;
  try {
    supplier = await getSupplier(session, params.id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const canEdit = session.role !== "munim";

  return (
    <PageContainer className="py-4">
      <PageHeader
        title={canEdit ? t("editTitle") : supplier.name}
        backHref="/suppliers"
        backLabel={tc("back")}
      />
      {canEdit ? (
        <SupplierForm initial={supplier} />
      ) : (
        <SupplierDetailView supplier={supplier} />
      )}
    </PageContainer>
  );
}
