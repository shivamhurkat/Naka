import { z } from "zod";

export const BuyerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  city: z.string().max(100).optional().or(z.literal("").transform(() => undefined)),
  gst_number: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export type BuyerInput = z.infer<typeof BuyerSchema>;
