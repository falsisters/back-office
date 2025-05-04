import { z } from "zod";
import { BillTypeEnum } from "./schema.type";

export const BillSchema = z.object({
  amount: z.number().int().min(0),
  type: BillTypeEnum,
});

export const CreateBillCountSchema = z.object({
  bills: z.array(BillSchema).min(1, "At least one bill is required"),
  expenses: z.number().min(0),
  beginningBalance: z.number().min(0),
});

export type CreateBillCountType = z.infer<typeof CreateBillCountSchema>;