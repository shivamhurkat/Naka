import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getInboundLot } from "@/lib/data/inbound-lots";
import { NotFoundError } from "@/lib/errors";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import LotDetailView from "./LotDetailView";

export default async function LotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireSession();
  const t = await getTranslations("lots");

  let lot;
  try {
    lot = await getInboundLot(session, params.id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <PageContainer className="py-4">
      <PageHeader title={t("detailTitle")} backHref="/lots" />
      <LotDetailView lot={lot} session={session} />
    </PageContainer>
  );
}
