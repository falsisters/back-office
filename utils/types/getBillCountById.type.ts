import { z } from "zod";
import { BillTypeEnum } from "./schema.type";

const BillSchema = z.object({
  id: z.string().cuid(),
  type: BillTypeEnum,
  amount: z.number().int().min(0),
  value: z.number().min(0),
});

const BillsByTypeSchema = z.record(
  BillTypeEnum,
  z.number().int().min(0)
);

export const GetBillCountByIdPayloadSchema = z.object({
  id: z.string().cuid(),
  date: z.date(),
  expenses: z.number().min(0),
  showExpenses: z.boolean(),
  beginningBalance: z.number().min(0),
  showBeginningBalance: z.boolean(),
  bills: z.array(BillSchema),
  billsByType: BillsByTypeSchema,
  billsTotal: z.number().min(0),
  totalWithExpenses: z.number().min(0),
  finalTotal: z.number(),
});

export type GetBillCountByIdPayload = z.infer<typeof GetBillCountByIdPayloadSchema>;