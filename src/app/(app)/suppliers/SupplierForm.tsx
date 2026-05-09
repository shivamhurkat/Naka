"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Supplier } from "@/lib/data/suppliers";
import { normalizeIndianPhone } from "@/lib/phone";
import TextField from "@/components/TextField";
import TextareaField from "@/components/TextareaField";
import Button from "@/components/Button";
import FormActions from "@/components/FormActions";

interface SupplierFormProps {
  initial?: Supplier;
}

export default function SupplierForm({ initial }: SupplierFormProps) {
  const t = useTranslations("suppliers");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const tv = useTranslations("validation");
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [village, setVillage] = useState(initial?.village ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function handlePhoneBlur() {
    const trimmed = phone.trim();
    if (!trimmed) { setErrors((p) => ({ ...p, phone: "" })); return; }
    const result = normalizeIndianPhone(trimmed);
    if (result.ok) {
      setPhone(result.national);
      setErrors((p) => ({ ...p, phone: "" }));
    } else {
      setErrors((p) => ({ ...p, phone: tv("phone.invalid") }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const body = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      village: village.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const url = initial ? `/api/suppliers/${initial.id}` : "/api/suppliers";
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

      toast.success(t("saveSuccess"));
      router.push("/suppliers");
      router.refresh();
    } catch {
      toast.error(tc("retry"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-24">
      <TextField
        label={tc("name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        required
        autoFocus={!initial}
        error={errors.name}
      />
      <TextField
        label={tc("phone")}
        value={phone}
        onChange={(e) => { setPhone(e.target.value.slice(0, 15)); setErrors((p) => ({ ...p, phone: "" })); }}
        onBlur={handlePhoneBlur}
        placeholder={t("phonePlaceholder")}
        inputMode="tel"
        maxLength={15}
        hint={`(${tc("optional")})`}
        error={errors.phone}
      />
      <TextField
        label={tc("village")}
        value={village}
        onChange={(e) => setVillage(e.target.value)}
        placeholder={t("villagePlaceholder")}
        hint={`(${tc("optional")})`}
        error={errors.village}
      />
      <TextareaField
        label={tc("notes")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t("notesPlaceholder")}
        hint={`(${tc("optional")})`}
        error={errors.notes}
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
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? tc("saving") : tc("save")}
        </Button>
      </FormActions>
    </form>
  );
}
