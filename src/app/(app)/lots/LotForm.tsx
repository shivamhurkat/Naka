"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import SearchableSelect, { SelectOption } from "@/components/forms/SearchableSelect";
import NumberField from "@/components/forms/NumberField";
import TextareaField from "@/components/TextareaField";
import Button from "@/components/Button";
import FormActions from "@/components/FormActions";
import type { InboundLotWithRefs } from "@/lib/data/inbound-lots";

interface LotFormProps {
  initial?: InboundLotWithRefs;
}

function formatInr(val: number): string {
  return val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function toLocalDatetimeValue(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LotForm({ initial }: LotFormProps) {
  const t = useTranslations("lots");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const [items, setItems] = useState<SelectOption[]>([]);

  const [supplierId, setSupplierId] = useState(initial?.supplier_id ?? "");
  const [itemId, setItemId] = useState(initial?.item_id ?? "");
  const [vehicleNumber, setVehicleNumber] = useState(initial?.vehicle_number ?? "");
  const [grossWeight, setGrossWeight] = useState(initial ? String(initial.gross_weight_qtl) : "");
  const [tareWeight, setTareWeight] = useState(initial ? String(initial.tare_weight_qtl) : "");
  const [moisture, setMoisture] = useState(initial?.moisture_pct != null ? String(initial.moisture_pct) : "");
  const [rate, setRate] = useState(initial ? String(initial.rate_per_qtl) : "");
  const [deduction, setDeduction] = useState(initial ? String(initial.deduction_amount) : "0");
  const [receivedAt, setReceivedAt] = useState(toLocalDatetimeValue(initial?.received_at));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/suppliers?activeOnly=true&pageSize=200")
      .then((r) => r.json())
      .then((j) => setSuppliers((j.data ?? []).map((s: { id: string; name: string }) => ({ value: s.id, label: s.name }))));

    fetch("/api/items")
      .then((r) => r.json())
      .then((j) => setItems((j ?? []).map((i: { id: string; name: string }) => ({ value: i.id, label: i.name }))));
  }, []);

  const gross = parseFloat(grossWeight) || 0;
  const tare = parseFloat(tareWeight) || 0;
  const netWeight = Math.max(0, gross - tare);
  const rateNum = parseFloat(rate) || 0;
  const totalAmount = netWeight * rateNum;
  const deductionNum = parseFloat(deduction) || 0;
  const payableAmount = totalAmount - deductionNum;

  function validate() {
    const errs: Record<string, string> = {};
    if (!supplierId) errs.supplier_id = tc("required");
    if (!itemId) errs.item_id = tc("required");
    if (!grossWeight || gross <= 0) errs.gross_weight_qtl = tc("required");
    if (tare >= gross) errs.tare_weight_qtl = t("validationGrossGtTare");
    const m = parseFloat(moisture);
    if (moisture && (m < 0 || m > 30)) errs.moisture_pct = t("validationMoistureRange");
    if (!rate || rateNum <= 0) errs.rate_per_qtl = tc("required");
    return errs;
  }

  async function submit(addAnother = false) {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);

    const receivedAtISO = new Date(receivedAt).toISOString();

    const body: Record<string, unknown> = {
      supplier_id: supplierId,
      item_id: itemId,
      vehicle_number: vehicleNumber.trim().toUpperCase() || undefined,
      gross_weight_qtl: gross,
      tare_weight_qtl: tare,
      moisture_pct: moisture ? parseFloat(moisture) : undefined,
      rate_per_qtl: rateNum,
      deduction_amount: deductionNum,
      received_at: receivedAtISO,
      notes: notes.trim() || undefined,
    };

    const url = initial ? `/api/lots/${initial.id}` : "/api/lots";
    const method = initial ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409 && json.error === "duplicate") {
          const msgKey = (json.messageKey as string)?.replace(/^errors\./, "") ?? "duplicate.generic";
          const msg = te(msgKey as Parameters<typeof te>[0]);
          if (json.field) {
            setErrors({ [json.field]: msg });
          } else {
            toast.error(msg);
          }
          return;
        }
        if (json.fields) {
          setErrors(
            Object.fromEntries(
              Object.entries(json.fields).map(([k, v]) => [k, (v as string[])[0]])
            )
          );
        } else {
          toast.error(json.error_key ?? tc("retry"));
        }
        return;
      }

      const lotNumber: string = json.lot_number ?? "";
      toast.success(`${t("saved")}${lotNumber ? ` — ${lotNumber}` : ""}`);

      if (addAnother) {
        setItemId("");
        setVehicleNumber("");
        setGrossWeight("");
        setTareWeight("");
        setMoisture("");
        setRate("");
        setDeduction("0");
        setReceivedAt(toLocalDatetimeValue());
        setNotes("");
        setErrors({});
      } else {
        // Redirect to lot detail so photos can be attached immediately
        router.push(initial ? `/lots/${initial.id}` : `/lots/${json.id}`);
        router.refresh();
      }
    } catch {
      toast.error(tc("retry"));
    } finally {
      setSaving(false);
    }
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      submit(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supplierId, itemId, vehicleNumber, grossWeight, tareWeight, moisture, rate, deduction, receivedAt, notes]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-28">
      {/* Supplier */}
      <div className="relative">
        <SearchableSelect
          label={t("supplier")}
          options={suppliers}
          value={supplierId}
          onChange={setSupplierId}
          placeholder={t("selectSupplier")}
          required
          error={errors.supplier_id}
        />
      </div>

      {/* Item */}
      <div className="relative">
        <SearchableSelect
          label={t("item")}
          options={items}
          value={itemId}
          onChange={setItemId}
          placeholder={t("selectItem")}
          required
          error={errors.item_id}
        />
      </div>

      {/* Vehicle number */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">
          {t("vehicleNumber")}
          <span className="ml-1 text-xs text-neutral-400 font-normal">({tc("optional")})</span>
        </label>
        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
          placeholder="MH31AB1234"
          maxLength={20}
          className="h-11 rounded-xl border border-neutral-300 px-3 text-base text-neutral-900 placeholder:text-neutral-400 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Gross + Tare weights */}
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={t("grossWeight")}
          value={grossWeight}
          onChange={setGrossWeight}
          placeholder="100"
          suffix="qtl"
          required
          min={0}
          max={9999}
          error={errors.gross_weight_qtl}
        />
        <NumberField
          label={t("tareWeight")}
          value={tareWeight}
          onChange={setTareWeight}
          placeholder="5"
          suffix="qtl"
          required
          min={0}
          max={9999}
          error={errors.tare_weight_qtl}
        />
      </div>

      {/* Live net weight */}
      {(grossWeight || tareWeight) && (
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 flex justify-between items-center">
          <span className="text-sm text-neutral-500">{t("netWeightLabel")}</span>
          <span className="text-base font-semibold text-primary-700">
            {netWeight.toLocaleString("en-IN", { maximumFractionDigits: 3 })} qtl
          </span>
        </div>
      )}

      {/* Moisture */}
      <NumberField
        label={t("moisture")}
        value={moisture}
        onChange={setMoisture}
        placeholder="12"
        suffix="%"
        min={0}
        max={30}
        hint={`(${tc("optional")})`}
        error={errors.moisture_pct}
      />

      {/* Rate */}
      <NumberField
        label={t("ratePerQtl")}
        value={rate}
        onChange={setRate}
        placeholder="4500"
        prefix="₹"
        required
        error={errors.rate_per_qtl}
      />

      {/* Deduction */}
      <NumberField
        label={t("deduction")}
        value={deduction}
        onChange={setDeduction}
        placeholder="0"
        prefix="₹"
        hint={`(${tc("optional")})`}
        error={errors.deduction_amount}
      />

      {/* Live calculations */}
      {rate && (
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">{t("totalAmount")}</span>
            <span className="text-base font-medium text-neutral-800">₹ {formatInr(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-primary-700">{t("payableAmount")}</span>
            <span className="text-lg font-bold text-primary-700">₹ {formatInr(payableAmount)}</span>
          </div>
        </div>
      )}

      {/* Received at */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-neutral-700">{t("receivedAt")}</label>
        <input
          type="datetime-local"
          value={receivedAt}
          onChange={(e) => setReceivedAt(e.target.value)}
          className="h-11 rounded-xl border border-neutral-300 px-3 text-base text-neutral-900 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Notes */}
      <TextareaField
        label={tc("notes")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="…"
        hint={`(${tc("optional")})`}
      />

      <FormActions>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => router.back()}
          disabled={saving}
        >
          {tc("cancel")}
        </Button>
        {!initial && (
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-sm"
            onClick={() => submit(true)}
            disabled={saving}
          >
            {t("saveAndAddAnother")}
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? tc("saving") : tc("save")}
        </Button>
      </FormActions>
    </form>
  );
}
