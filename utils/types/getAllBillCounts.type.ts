import { z } from "zod";
import { BillCountSchema } from "./schema.type";

export const BillCountGroupSchema = z.object({
  date: z.string(),
  counts: z.array(BillCountSchema),
});

export const GetAllBillCountsPayloadSchema = z.array(BillCountGroupSchema);

export type GetAllBillCountsPayload = z.infer<typeof GetAllBillCountsPayloadSchema>;