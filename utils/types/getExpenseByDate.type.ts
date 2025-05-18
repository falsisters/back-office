import { z } from "zod";
import { ExpenseListSchema, ExpenseItemsSchema } from "./schema.type";

export const GetExpenseByDateSchema = z.object({
  date: z.string().optional(),
});

export type GetExpenseByDateType = z.infer<typeof GetExpenseByDateSchema>;

export const ExpenseWithItemsSchema = ExpenseListSchema.extend({
  ExpenseItems: z.array(ExpenseItemsSchema),
});

export type ExpenseWithItemsType = z.infer<typeof ExpenseWithItemsSchema>;