# Bill Count Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/BillCount/createBillCount.ts` | `useCreateBillCount` mutation |
| `src/lib/server/BillCount/createCashierBillCount.ts` | `useCreateCashierBillCount` mutation |
| `src/lib/server/BillCount/deleteBillCountById.ts` | `useDeleteBillCount` mutation |
| `src/lib/server/BillCount/editBillCount.ts` | `useEditBillCount` mutation |
| `src/lib/server/BillCount/editCashierBillCount.ts` | `useEditCashierBillCount` mutation |
| `src/lib/server/BillCount/getBillCountById.ts` | `useBillCount` query |
| `src/lib/server/BillCount/getCashierBillCountByDate.ts` | `useBillCountsByCashier` query |
| `src/lib/server/BillCount/getUserBillCountByDate.ts` | `useUserBillCounts` query |

## New Hook API

```typescript
// src/hooks/useBillCounts.ts

export function useUserBillCounts(date?: string) {
  return useQuery({
    queryKey: ['billCounts', 'user', { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/bills/user?${params}`).then(r => r.data);
    },
  });
}

export function useBillCountsByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ['billCounts', 'cashier', cashierId, { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/bills/cashier/${cashierId}?${params}`).then(r => r.data);
    },
    enabled: !!cashierId,
  });
}

export function useBillCount(id: string) {
  return useQuery({
    queryKey: ['billCounts', id],
    queryFn: () => apiClient.get(`/api/bills/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateBillCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBillCountType) =>
      apiClient.post('/api/bills/user', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billCounts'] }),
  });
}

export function useCreateCashierBillCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cashierId, data }: { cashierId: string; data: CreateBillCountType }) =>
      apiClient.post(`/api/bills/cashier/${cashierId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billCounts'] }),
  });
}

export function useEditBillCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditBillCountType }) =>
      apiClient.patch(`/api/bills/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billCounts'] }),
  });
}

export function useEditCashierBillCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cashierId, id, data }: { cashierId: string; id: string; data: EditBillCountType }) =>
      apiClient.patch(`/api/bills/cashier/${cashierId}/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billCounts'] }),
  });
}

export function useDeleteBillCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/bills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billCounts'] }),
  });
}
```

## Components to update

- [ ] `src/components/Bills/BillsList.tsx` — Replace `useEffect` fetch with `useUserBillCounts()` query
- [ ] `src/components/Bills/CreateBillCount.tsx` — Replace server action with `useCreateBillCount()` mutation
- [ ] `src/components/Bills/EditBillCount.tsx` — Replace server action with `useEditBillCount()` mutation

## Verification

- [ ] Bill count list loads
- [ ] Filter by date works
- [ ] Create/upsert bill count works
- [ ] Edit bill count works
- [ ] Delete bill count works
- [ ] Error toast shows API error message
