import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { listBuyers } from "@/lib/data/buyers";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import BuyerList from "./BuyerList";

export default async function BuyersPage() {
  const session = await requireSession();
  const t = await getTranslations("buyers");
  const tc = await getTranslations("common");

  const canEdit = session.role !== "munim";

  const { data, total } = await listBuyers(session, {
    activeOnly: true,
    page: 1,
    pageSize: 20,
  });

  return (
    <PageContainer className="py-4">
      <PageHeader
        title={t("title")}
        action={
          canEdit ? (
            <Link
              href="/buyers/new"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary-600 text-white text-sm font-medium"
            >
              <Plus size={16} />
              {tc("add")}
            </Link>
          ) : undefined
        }
      />
      <BuyerList
        initialData={data}
        initialTotal={total}
        canEdit={canEdit}
      />
    </PageContainer>
  );
}
