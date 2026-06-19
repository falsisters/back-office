# Expenses Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Expense/createCashierExpenses.ts` | `useCreateCashierExpense` mutation |
| `src/lib/server/Expense/createExpenses.ts` | `useCreateExpense` mutation |
| `src/lib/server/Expense/deleteExpense.ts` | `useDeleteExpense` mutation |
| `src/lib/server/Expense/editExpenses.ts` | `useEditExpense` mutation |
| `src/lib/server/Expense/getAllExpenses.ts` | `useExpenses` query |
| `src/lib/server/Expense/getCashierExpensesByDate.ts` | `useExpensesByCashier` query |
| `src/lib/server/Expense/getExpensesByDate.ts` | `useExpenses` query (with date param) |
| `src/lib/server/Expense/getExpensesById.ts` | `useExpense` query |

## New Hook API

```typescript
// src/hooks/useExpenses.ts

export function useExpenses(date?: string) {
  return useQuery({
    queryKey: ['expenses', { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/expenses/user?${params}`).then(r => r.data);
    },
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => apiClient.get(`/api/expenses/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useExpensesByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ['expenses', 'cashier', cashierId, { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/expenses/cashier/${cashierId}?${params}`).then(r => r.data);
    },
    enabled: !!cashierId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseType) =>
      apiClient.post('/api/expenses/user/create', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useCreateCashierExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cashierId, data }: { cashierId: string; data: CreateExpenseType }) =>
      apiClient.post(`/api/expenses/cashier/${cashierId}/create`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useEditExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditExpenseType }) =>
      apiClient.patch(`/api/expenses/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/expenses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
```

## Pages to update

- [ ] `src/app/expenses/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Expenses/ExpenseList.tsx` — Replace `useEffect` fetch + `error` + `isLoading` states with `useExpenses()` query
- [ ] `src/components/Expenses/CreateExpense.tsx` — Replace server action with `useCreateExpense()` mutation
- [ ] `src/components/Expenses/ExpenseItem.tsx` — Replace server action with `useDeleteExpense()` mutation

## Verification

- [ ] Expense list loads
- [ ] Filter by date works
- [ ] Create expense — success toast, list refreshes
- [ ] Delete expense — success toast, list refreshes
- [ ] Edit expense works
- [ ] Empty state shows "No expenses found"
- [ ] Error toast shows API error message
- [ ] Loading spinner shows during fetch
