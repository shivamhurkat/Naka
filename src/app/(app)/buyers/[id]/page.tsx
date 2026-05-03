import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getBuyer } from "@/lib/data/buyers";
import { NotFoundError } from "@/lib/errors";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import BuyerForm from "../BuyerForm";
import BuyerDetailView from "./BuyerDetailView";

export default async function BuyerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireSession();
  const t = await getTranslations("buyers");
  const tc = await getTranslations("common");

  let buyer;
  try {
    buyer = await getBuyer(session, params.id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const canEdit = session.role !== "munim";

  return (
    <PageContainer className="py-4">
      <PageHeader
        title={canEdit ? t("editTitle") : buyer.name}
        backHref="/buyers"
        backLabel={tc("back")}
      />
      {canEdit ? (
        <BuyerForm initial={buyer} />
      ) : (
        <BuyerDetailView buyer={buyer} />
      )}
    </PageContainer>
  );
}
