"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { CreateExpenseType } from "../../utils/types/Expense/createExpense.type";
import type { EditExpenseType } from "../../utils/types/Expense/editExpense.type";
import type { GetAllExpensesPayload } from "../../utils/types/Expense/getAllExpenses.type";
import type { ExpenseWithItemsType } from "../../utils/types/Expense/getExpenseByDate.type";

async function fetchExpenses(date?: string): Promise<GetAllExpensesPayload> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(
    `/api/expenses/user/today?${params}`
  );
  return Array.isArray(data) ? data : data ? [data] : [];
}

async function fetchExpense(id: string): Promise<ExpenseWithItemsType> {
  const { data } = await apiClient.get(`/api/expenses/user/${id}`);
  return data;
}

async function fetchExpensesByCashier(
  cashierId: string,
  date?: string
): Promise<ExpenseWithItemsType | null> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(
    `/api/expenses/cashier/${cashierId}/today?${params}`
  );
  return data ?? null;
}

async function createCashierExpenseFn({
  cashierId,
  data,
}: {
  cashierId: string;
  data: CreateExpenseType;
}): Promise<ExpenseWithItemsType> {
  const { data: response } = await apiClient.post(
    `/api/expenses/cashier/${cashierId}/create`,
    data
  );
  return response;
}

async function editExpenseFn(
  data: EditExpenseType
): Promise<ExpenseWithItemsType> {
  const { expenseListId, ...rest } = data;
  const { data: response } = await apiClient.put(
    `/api/expenses/user/update/${expenseListId}`,
    rest
  );
  return response;
}

async function deleteExpenseFn(id: string): Promise<void> {
  await apiClient.delete(`/api/expenses/user/${id}`);
}

export function useExpenses(date?: string) {
  return useQuery({
    queryKey: ["expenses", { date }],
    queryFn: () => fetchExpenses(date),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: () => fetchExpense(id),
    enabled: !!id,
  });
}

export function useExpensesByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["expenses", "cashier", cashierId, { date }],
    queryFn: () => fetchExpensesByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useCreateCashierExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashierExpenseFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editExpenseFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpenseFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
