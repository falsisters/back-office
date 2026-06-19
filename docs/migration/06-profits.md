# Profits Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Profits/getProfitsByCashier.ts` | `useProfitsByCashier` query |

## New Hook API

```typescript
// src/hooks/useProfits.ts

export function useProfitsByCashier(cashierId: string, filters?: ProfitFilter) {
  return useQuery({
    queryKey: ['profits', 'cashier', cashierId, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      return apiClient.get(`/api/profit/cashier/${cashierId}?${params}`).then(r => r.data);
    },
    enabled: !!cashierId,
  });
}
```

## Pages to update

- [ ] `src/app/profits/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Profits/CashierProfitList.tsx` — Replace `useEffect` fetch with `useProfitsByCashier()` query. Keep the race-condition guard logic (transition to using Tanstack Query's built-in `queryKey` invalidation instead of manual `currentRequestId` tracking).

## Race condition handling

The current implementation uses a manual `currentRequestId` check to ignore stale responses. Tanstack Query handles this automatically — when query keys change, only the latest response is applied. Simplify the component by removing the manual tracking.

## Verification

- [ ] Profit list loads for selected cashier
- [ ] Changing cashier refreshes profit data
- [ ] Changing date range refreshes profit data
- [ ] No stale data shown on rapid cashier switching
- [ ] Loading spinner shows during fetch
- [ ] Error toast shows API error message
