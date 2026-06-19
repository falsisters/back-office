# Stocks & Transfers Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Transfers/getAllTransfers.ts` | `useTransfers` query |
| `src/lib/server/Transfers/getTransfersByCashier.ts` | `useTransfersByCashier` query |
| `src/lib/server/Transfers/getTransfersByCashierWithDate.ts` | `useTransfersByCashier` query (with date) |
| `src/lib/server/Storage/index.ts` | `useStorageUsage`, `useExportStorage`, `useClearStorage` (moved to useStorage) |

## New Hook API

```typescript
// src/hooks/useStocks.ts

export function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: () => apiClient.get('/api/transfer').then(r => r.data),
  });
}

export function useTransfersByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ['transfers', 'cashier', cashierId, { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/transfer/cashier/${cashierId}?${params}`).then(r => r.data);
    },
    enabled: !!cashierId,
  });
}

export function useStockStats() {
  return useQuery({
    queryKey: ['stocks', 'stats'],
    queryFn: () => apiClient.get('/api/stock/statistics').then(r => r.data),
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: ['storage', 'usage'],
    queryFn: () => apiClient.get('/api/storage/usage').then(r => r.data),
  });
}

export function useExportStorage() {
  return useMutation({
    mutationFn: () => apiClient.get('/api/storage/export'),
  });
}

export function useClearStorage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete('/api/storage/clear'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['storage'] }),
  });
}
```

## Pages to update

- [ ] `src/app/stocks/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Stocks/StocksManagement.tsx` — Replace `useEffect` fetch + `error` + `isLoading` states with `useTransfers()` + `useStockStats()` queries
- [ ] `src/components/Stocks/TransferHistory.tsx` — Replace `useEffect` fetch with `useTransfersByCashier()` query

## Special Considerations

- **Timezone logic** in `getAllTransfers.ts` — Same fix as Sales. Move to shared utility, apply client-side.
- **Storage** module lives in `Storage/index.ts` but is closely related to Stocks. Consider merging into `useStocks.ts` or keeping separate `useStorage.ts`.

## Verification

- [ ] Transfers list loads
- [ ] Filter by cashier works
- [ ] Filter by date works
- [ ] Stock stats display correctly
- [ ] Storage usage displays correctly
- [ ] Export storage works
- [ ] Clear storage works
- [ ] Error toast shows API error message
