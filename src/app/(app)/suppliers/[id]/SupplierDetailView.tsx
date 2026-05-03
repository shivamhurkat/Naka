import { getTranslations } from "next-intl/server";
import { Phone, MapPin, FileText } from "lucide-react";
import type { Supplier } from "@/lib/data/suppliers";
import Card from "@/components/Card";

interface SupplierDetailViewProps {
  supplier: Supplier;
}

export default async function SupplierDetailView({ supplier }: SupplierDetailViewProps) {
  const tc = await getTranslations("common");

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">
            {tc("name")}
          </p>
          <p className="text-base font-semibold text-neutral-900">{supplier.name}</p>
        </div>

        {supplier.phone && (
          <div className="flex items-center gap-2 text-neutral-700">
            <Phone size={14} className="text-neutral-400 shrink-0" />
            <span>{supplier.phone}</span>
          </div>
        )}

        {supplier.village && (
          <div className="flex items-center gap-2 text-neutral-700">
            <MapPin size={14} className="text-neutral-400 shrink-0" />
            <span>{supplier.village}</span>
          </div>
        )}

        {supplier.notes && (
          <div className="flex items-start gap-2 text-neutral-700">
            <FileText size={14} className="text-neutral-400 shrink-0 mt-0.5" />
            <span className="text-sm">{supplier.notes}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
