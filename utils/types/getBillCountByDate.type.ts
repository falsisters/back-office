import { z } from "zod";
import { BillTypeEnum } from "./schema.type";

const BillSchema = z.object({
  id: z.string().cuid(),
  type: BillTypeEnum,
  amount: z.number().int().min(0),
  value: z.number().min(0),
});

const BillsByTypeSchema = z.record(BillTypeEnum, z.number().int().min(0));

export const GetBillCountForDatePayloadSchema = z
  .object({
    id: z.string().cuid(),
    startingAmount: z.number().min(0),
    date: z.date(),
    expenses: z.number().min(0),
    showExpenses: z.boolean(),
    beginningBalance: z.number().min(0),
    showBeginningBalance: z.boolean(),
    totalCash: z.number().min(0),
    bills: z.array(BillSchema),
    billsByType: BillsByTypeSchema,
    billsTotal: z.number().min(0),
    totalWithExpenses: z.number().min(0),
    finalTotal: z.number(),
  })
  .nullable();

export type GetBillCountForDatePayload = z.infer<
  typeof GetBillCountForDatePayloadSchema
>;
