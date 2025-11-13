import { z } from "zod";

export const TransferTypeEnum = z.enum([
  "OUT",
  "RETURN_TO_WAREHOUSE",
  "KAHON",
  "REPACK",
]);

// Helper function to parse decimal values from API responses
const parseDecimal = z
  .union([z.number(), z.string(), z.null()])
  .transform((val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof val === "number") return val;
    return 0;
  });

export const TransferSchema = z.object({
  id: z.string(),
  quantity: parseDecimal,
  name: z.string(),
  type: TransferTypeEnum,
  cashierId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TransferResponse = z.infer<typeof TransferSchema>;
export type GetAllTransfersResponse = TransferResponse[];

export const TransferFilterSchema = z.object({
  date: z.string().optional(), // ISO date string
});

export type TransferFilter = z.infer<typeof TransferFilterSchema>;
