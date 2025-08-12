import { z } from "zod";
import { BillTypeEnum } from "../schema.type";

const BillDtoSchema = z.object({
  amount: z.number().int().min(0),
  type: BillTypeEnum,
});

export const CreateBillCountSchema = z.object({
  date: z.string().optional(),
  beginningBalance: z.number().optional(), // Remove min(0) to allow negative values like backend
  showBeginningBalance: z.boolean().optional(),
  bills: z.array(BillDtoSchema).optional(),
});

export type CreateBillCountType = z.infer<typeof CreateBillCountSchema>;
