# Deliveries Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Deliveries/createDelivery.ts` | `useCreateDelivery` mutation |
| `src/lib/server/Deliveries/deleteDelivery.ts` | `useDeleteDelivery` mutation |
| `src/lib/server/Deliveries/editDelivery.ts` | `useEditDelivery` mutation |
| `src/lib/server/Deliveries/getAllDeliveriesByCashierId.ts` | `useDeliveriesByCashier` query |
| `src/lib/server/Deliveries/getAllDeliveriesByUserId.ts` | `useDeliveries` query |
| `src/lib/server/Deliveries/getDeliveryById.ts` | `useDelivery` query |

## New Hook API

```typescript
// src/hooks/useDeliveries.ts

export function useDeliveries() {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: () => apiClient.get('/api/delivery/user').then(r => r.data),
  });
}

export function useDeliveriesByCashier(cashierId: string) {
  return useQuery({
    queryKey: ['deliveries', 'cashier', cashierId],
    queryFn: () => apiClient.get(`/api/delivery/cashier/${cashierId}`).then(r => r.data),
    enabled: !!cashierId,
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: ['deliveries', id],
    queryFn: () => apiClient.get(`/api/delivery/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliveryDto) =>
      apiClient.post('/api/delivery/create', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  });
}

export function useEditDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditDeliveryDto }) =>
      apiClient.patch(`/api/delivery/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  });
}

export function useDeleteDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/delivery/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  });
}
```

## Pages to update

- [ ] `src/app/deliveries/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Deliveries/DeliveryList.tsx` — Replace `useEffect` fetch with `useDeliveries()` query
- [ ] `src/components/Deliveries/CashierDeliveryList.tsx` — Replace `useEffect` fetch with `useDeliveriesByCashier()` query
- [ ] `src/components/Deliveries/DeliveryItem.tsx` — Replace server action with `useDeleteDelivery()` mutation. **Fix `alert()` → sonner toast.**

## Verification

- [ ] Delivery list loads
- [ ] Create delivery works
- [ ] Edit delivery works
- [ ] Delete delivery — sonner toast (not alert!), list refreshes
- [ ] Filter by cashier works
- [ ] Empty state shows "No deliveries found"
- [ ] Error toast shows API error message
