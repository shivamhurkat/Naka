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

export const BuyerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: phoneField,
  city: z.string().max(100).optional().or(z.literal("").transform(() => undefined)),
  gst_number: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export type BuyerInput = z.infer<typeof BuyerSchema>;
