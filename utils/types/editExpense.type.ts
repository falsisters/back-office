import { CreateExpenseType } from "./createExpense.type";

export type EditExpenseType = CreateExpenseType & {
  expenseListId: string;
};