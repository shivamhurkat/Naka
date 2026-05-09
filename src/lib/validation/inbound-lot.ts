import { z } from "zod";

export const InboundLotSchema = z
  .object({
    supplier_id: z.string().uuid(),
    item_id: z.string().uuid(),
    vehicle_number: z
      .string()
      .max(20)
      .transform((v) => (v.trim() ? v.trim().toUpperCase() : undefined))
      .optional()
      .or(z.literal("").transform(() => undefined)),
    gross_weight_qtl: z.coerce.number().positive().max(9999),
    tare_weight_qtl: z.coerce.number().min(0).max(9999),
    moisture_pct: z.coerce.number().min(0).max(30).optional().nullable(),
    rate_per_qtl: z.coerce.number().positive(),
    deduction_amount: z.coerce.number().min(0).default(0),
    received_at: z.string().datetime({ offset: true }).optional(),
    notes: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
  })
  .refine((d) => d.gross_weight_qtl > d.tare_weight_qtl, {
    message: "lots.validationGrossGtTare",
    path: ["tare_weight_qtl"],
  });

export type InboundLotInput = z.infer<typeof InboundLotSchema>;
