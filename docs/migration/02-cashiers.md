# Cashiers Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Cashier/createCashier.ts` | `useCreateCashier` mutation |
| `src/lib/server/Cashier/deleteCashier.ts` | `useDeleteCashier` mutation |
| `src/lib/server/Cashier/editCashier.ts` | `useEditCashier` mutation |
| `src/lib/server/Cashier/getAllCashiersByUserId.ts` | `useCashiers` query |
| `src/lib/server/Cashier/getCashierById.ts` | `useCashier` query |
| `src/lib/server/Cashier/getCashiers.ts` | `useCashiers` query (merged) |

## New Hook API

```typescript
// src/hooks/useCashiers.ts

export function useCashiers() {
  return useQuery({
    queryKey: ['cashiers'],
    queryFn: () => apiClient.get('/api/cashier/all').then(r => r.data),
  });
}

export function useCashier(id: string) {
  return useQuery({
    queryKey: ['cashiers', id],
    queryFn: () => apiClient.get(`/api/cashier/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateCashier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCashierType) =>
      apiClient.post('/api/cashier/register', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cashiers'] }),
  });
}

export function useEditCashier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditCashierType }) =>
      apiClient.patch(`/api/cashier/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cashiers'] }),
  });
}

export function useDeleteCashier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/cashier/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cashiers'] }),
  });
}
```

## Pages to update

- [ ] `src/app/cashiers/page.tsx` → Add `"use client"`, remove `getUserData` call, use `useAuth().isAuthenticated` for auth gate

## Components to update

- [ ] `src/components/Cashiers/CashierList.tsx` — Remove `useEffect` fetch + `error` state + `isLoading` state. Replace with `useCashiers()`.
- [ ] `src/components/Cashiers/CreateCashier.tsx` — Replace `createCashier` server action with `useCreateCashier()`
- [ ] `src/components/Cashiers/EditCashier.tsx` — Replace `editCashier` server action with `useEditCashier()`
- [ ] `src/components/Cashiers/DeleteConfirmDialog.tsx` — Replace `deleteCashier` server action with `useDeleteCashier()`
- [ ] `src/components/Cashier/CashierSelector.tsx` — Replace `useEffect` fetch with `useCashiers()`

## Error handling changes

| Before | After |
|--------|-------|
| `const [error, setError] = useState(null)` | Tanstack Query `isError` + `error` object |
| `const [isLoading, setIsLoading] = useState(true)` | Tanstack Query `isLoading` |
| `Alert variant="destructive"` | `toast.error(error.message)` via sonner |
| `Card with Try Again button` | Tanstack Query's built-in `refetch` on error |

## Verification

- [ ] Cashier list renders
- [ ] Create cashier — success toast, list refreshes
- [ ] Edit cashier — success toast, list refreshes
- [ ] Delete cashier — confirmation dialog, success toast, list refreshes
- [ ] Empty state — shows "No cashiers found" message
- [ ] Error state — toast shows API error message
- [ ] Loading state — spinner shows during fetch
