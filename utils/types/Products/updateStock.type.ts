import { z } from "zod";
import { Decimal } from "decimal.js";

// Helper function for decimal validation in stock updates
const decimalStock = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const decimal = new Decimal(val);
    return decimal.toNumber();
  })
  .refine((val) => val >= 0, { message: "Stock cannot be negative" });

export const UpdateStockSchema = z.object({
  productId: z.string(),
  sackPriceId: z.string().optional(),
  perKiloPriceId: z.string().optional(),
  newStock: decimalStock,
  operation: z.enum(["SET", "ADD", "SUBTRACT"]),
});

export type UpdateStockRequest = z.infer<typeof UpdateStockSchema>;

export const BulkUpdateStockSchema = z.object({
  updates: z.array(UpdateStockSchema),
});

export type BulkUpdateStockRequest = z.infer<typeof BulkUpdateStockSchema>;
