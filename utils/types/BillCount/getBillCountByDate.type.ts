import { z } from "zod";
import { BillTypeEnum } from "../schema.type";

const BillSchema = z.object({
  id: z.string().cuid(),
  type: BillTypeEnum,
  amount: z.number().int().min(0),
  value: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const BillsByTypeSchema = z.record(BillTypeEnum, z.number().int().min(0));

export const GetBillCountForDatePayloadSchema = z
  .object({
    id: z.string().cuid(),
    date: z.date(),
    updatedAt: z.date(),
    beginningBalance: z.number(), // Allow negative values to match backend
    showBeginningBalance: z.boolean(),
    totalCash: z.number().min(0),
    totalExpenses: z.number().min(0),
    netCash: z.number(), // Allow negative values
    bills: z.array(BillSchema),
    billsByType: BillsByTypeSchema,
    billsTotal: z.number().min(0),
    summaryStep1: z.number(), // Allow negative values
    summaryFinal: z.number(), // Allow negative values
  })
  .nullable();

export type GetBillCountForDatePayload = z.infer<
  typeof GetBillCountForDatePayloadSchema
>;
