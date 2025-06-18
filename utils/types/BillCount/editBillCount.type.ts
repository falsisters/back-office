import { z } from "zod";
import { BillTypeEnum } from "../schema.type";

const BillDtoSchema = z.object({
  amount: z.number().int().min(0),
  type: BillTypeEnum,
});

export const UpdateBillCountSchema = z.object({
  beginningBalance: z.number().min(0).optional(),
  showBeginningBalance: z.boolean().optional(),
  bills: z.array(BillDtoSchema).optional(),
});

export type UpdateBillCountType = z.infer<typeof UpdateBillCountSchema>;
