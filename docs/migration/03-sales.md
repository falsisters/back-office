# Sales Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Sales/deleteSale.ts` | `useDeleteSale` mutation |
| `src/lib/server/Sales/getAllSalesByUserId.ts` | `useSales` query |
| `src/lib/server/Sales/getSalesByCashier.ts` | `useSalesByCashier` query |
| `src/lib/server/Sales/getSalesCheck.ts` | `useSalesCheck` query |
| `src/lib/server/Sales/getVoidedSalesByUser.ts` | `useVoidedSales` query |

## New Hook API

```typescript
// src/hooks/useSales.ts

export function useSales(date?: string) {
  return useQuery({
    queryKey: ['sales', { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/sale/user?${params}`).then(r => r.data);
    },
  });
}

export function useSalesByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ['sales', 'cashier', cashierId, { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/sale/cashier/${cashierId}?${params}`).then(r => r.data);
    },
    enabled: !!cashierId,
  });
}

export function useSalesCheck() {
  return useQuery({
    queryKey: ['sales', 'check'],
    queryFn: () => apiClient.get('/api/sales-check').then(r => r.data),
  });
}

export function useVoidedSales(date?: string) {
  return useQuery({
    queryKey: ['sales', 'voided', { date }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      return apiClient.get(`/api/sale/voided?${params}`).then(r => r.data);
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/sale/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
```

## Pages to update

- [ ] `src/app/sales/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Sales/SalesList.tsx` — Replace `useEffect` fetch + `isLoaded` state with `useSales()` query
- [ ] `src/components/Sales/CashierSalesList.tsx` — Replace `useEffect` fetch with `useSalesByCashier()` query
- [ ] `src/components/Sales/CashierSalesListNew.tsx` — Same as above
- [ ] `src/components/Sales/VoidList.tsx` — Replace `useEffect` fetch with `useVoidedSales()` query
- [ ] `src/components/Sales/ProfitTracker.tsx` — Replace server action with `useSalesCheck()` query

## Special Considerations

- **Timezone logic** (`convertToPhilippineTimeISO`, `formatPhilippineTimeLog`) in `getAllSalesByUserId.ts` and `getAllTransfers.ts` — Move to utility functions in `src/lib/utils/timezone.ts` (already partially there). These run client-side now.
- **Zod schema validation** (`GetAllSalesByUserIdPayloadSchema.parse`) — Move to the query function's `select` option in Tanstack Query.
- **Socket.io** (`useSocket` hook) — Keep as-is. Socket is for real-time updates, separate from data fetching.
- **Cache bypass** (`bypassCache` param in `getSalesByCashier`) — Use Tanstack Query's `refetch()` or `queryClient.fetchQuery()`.
- **Default date** (today in Manila timezone) — Move to a shared utility.

## Error handling changes

Sales components currently **silently swallow errors** with only `console.error()`. After migration, errors will render in toast or inline UI.

## Verification

- [ ] Sales list loads with today's date
- [ ] Filter by cashier shows correct sales
- [ ] Voided sales list loads
- [ ] Profit tracker shows correct totals
- [ ] Delete sale works
- [ ] Date picker changes refetch data
- [ ] Loading spinner shows during fetch
- [ ] Error toast shows API error message (not silent)
