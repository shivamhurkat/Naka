import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { listInboundLots } from "@/lib/data/inbound-lots";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import LotList from "./LotList";

export default async function LotsPage() {
  const session = await requireSession();
  const t = await getTranslations("lots");
  const tc = await getTranslations("common");

  const { data, total } = await listInboundLots(session, { pageSize: 30 });

  return (
    <PageContainer className="py-4">
      <PageHeader
        title={t("title")}
        action={
          <Link
            href="/lots/new"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary-600 text-white text-sm font-medium"
          >
            <Plus size={16} />
            {tc("add")}
          </Link>
        }
      />
      <LotList initialData={data} initialTotal={total} />
    </PageContainer>
  );
}
