import { z } from "zod";
import { BillTypeEnum } from "./schema.type";

export const UpdateBillSchema = z.object({
  id: z.string(),
  amount: z.number().int().min(0),
  type: BillTypeEnum,
});

export const UpdateBillCountSchema = z.object({
  bills: z.array(UpdateBillSchema).min(1, "At least one bill is required"),
  expenses: z.number().min(0),
  beginningBalance: z.number().min(0),
});

export type UpdateBillCountType = z.infer<typeof UpdateBillCountSchema>;