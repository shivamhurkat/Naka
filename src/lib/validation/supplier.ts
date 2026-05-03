import { z } from "zod";

export const SupplierSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  village: z.string().max(100).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export type SupplierInput = z.infer<typeof SupplierSchema>;
