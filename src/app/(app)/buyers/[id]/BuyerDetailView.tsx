import { getTranslations } from "next-intl/server";
import { Phone, MapPin, FileText, Receipt } from "lucide-react";
import type { Buyer } from "@/lib/data/buyers";
import Card from "@/components/Card";

interface BuyerDetailViewProps {
  buyer: Buyer;
}

export default async function BuyerDetailView({ buyer }: BuyerDetailViewProps) {
  const tc = await getTranslations("common");

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">
            {tc("name")}
          </p>
          <p className="text-base font-semibold text-neutral-900">{buyer.name}</p>
        </div>

        {buyer.phone && (
          <div className="flex items-center gap-2 text-neutral-700">
            <Phone size={14} className="text-neutral-400 shrink-0" />
            <span>{buyer.phone}</span>
          </div>
        )}

        {buyer.city && (
          <div className="flex items-center gap-2 text-neutral-700">
            <MapPin size={14} className="text-neutral-400 shrink-0" />
            <span>{buyer.city}</span>
          </div>
        )}

        {buyer.gst_number && (
          <div className="flex items-center gap-2 text-neutral-700">
            <Receipt size={14} className="text-neutral-400 shrink-0" />
            <span className="font-mono text-sm">{buyer.gst_number}</span>
          </div>
        )}

        {buyer.notes && (
          <div className="flex items-start gap-2 text-neutral-700">
            <FileText size={14} className="text-neutral-400 shrink-0 mt-0.5" />
            <span className="text-sm">{buyer.notes}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
