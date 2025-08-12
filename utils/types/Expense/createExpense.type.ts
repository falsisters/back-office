import { z } from "zod";

// Helper to match backend parseDecimalPositive validation
const parseDecimalPositive = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (typeof val === "string") return parseFloat(val);
    return val;
  })
  .pipe(z.number().positive("Amount must be positive"));

export const CreateExpenseItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: parseDecimalPositive, // Updated to use decimal validation
});

export const CreateExpenseSchema = z.object({
  expenseItems: z
    .array(CreateExpenseItemSchema)
    .min(1, "At least one expense item is required"),
  date: z.string().optional(),
});

export type CreateExpenseType = z.infer<typeof CreateExpenseSchema>;
export type CreateExpenseItemType = z.infer<typeof CreateExpenseItemSchema>;
