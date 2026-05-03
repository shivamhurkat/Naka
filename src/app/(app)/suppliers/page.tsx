import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { listSuppliers } from "@/lib/data/suppliers";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import SupplierList from "./SupplierList";

export default async function SuppliersPage() {
  const session = await requireSession();
  const t = await getTranslations("suppliers");
  const tc = await getTranslations("common");

  const canEdit = session.role !== "munim";

  const { data, total } = await listSuppliers(session, {
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
              href="/suppliers/new"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary-600 text-white text-sm font-medium"
            >
              <Plus size={16} />
              {tc("add")}
            </Link>
          ) : undefined
        }
      />
      <SupplierList
        initialData={data}
        initialTotal={total}
        canEdit={canEdit}
      />
    </PageContainer>
  );
}
