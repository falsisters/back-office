import { z } from "zod";

export const CreateExpenseItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
});

export const CreateExpenseSchema = z.object({
  expenseItems: z.array(CreateExpenseItemSchema).min(1, "At least one expense item is required"),
    date: z.string().optional(),
});

export type CreateExpenseType = z.infer<typeof CreateExpenseSchema>;
export type CreateExpenseItemType = z.infer<typeof CreateExpenseItemSchema>;