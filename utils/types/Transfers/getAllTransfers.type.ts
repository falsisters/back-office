import { z } from "zod";

export const TransferTypeEnum = z.enum([
  "OWN_CONSUMPTION",
  "RETURN_TO_WAREHOUSE",
  "KAHON",
  "REPACK"
]);

export const TransferSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  name: z.string(),
  type: TransferTypeEnum,
  cashierId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type TransferResponse = z.infer<typeof TransferSchema>;
export type GetAllTransfersResponse = TransferResponse[];

export const TransferFilterSchema = z.object({
  date: z.string().optional() // ISO date string
});

export type TransferFilter = z.infer<typeof TransferFilterSchema>;