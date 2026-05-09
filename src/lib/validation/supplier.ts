import { z } from "zod";
import { normalizeIndianPhone } from "@/lib/phone";

const phoneField = z.preprocess(
  (val) => {
    if (val === null || val === undefined || val === "") return undefined;
    if (typeof val !== "string") return val;
    const r = normalizeIndianPhone(val.trim());
    return r.ok ? r.national : val.trim();
  },
  z.string().regex(/^[6-9]\d{9}$/, "validation.phone.invalid").optional()
);

export const SupplierSchema = z.object({
  name: z.string().min(2).max(100),
  phone: phoneField,
  village: z.string().max(100).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export type SupplierInput = z.infer<typeof SupplierSchema>;
