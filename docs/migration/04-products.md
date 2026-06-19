# Products Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Products/assignCashierToProduct.ts` | `useAssignCashierToProduct` mutation |
| `src/lib/server/Products/createProduct.ts` | `useCreateProduct` mutation |
| `src/lib/server/Products/createProductForCashier.ts` | `useCreateProductForCashier` mutation |
| `src/lib/server/Products/deleteProduct.ts` | `useDeleteProduct` mutation |
| `src/lib/server/Products/editProduct.ts` | `useEditProduct` mutation |
| `src/lib/server/Products/getAllProductsByUserId.ts` | `useProducts` query |
| `src/lib/server/Products/getProductById.ts` | `useProduct` query |
| `src/lib/server/Products/getProductsByCashier.ts` | `useProductsByCashier` query |
| `src/lib/server/Products/getUnassignedProducts.ts` | `useUnassignedProducts` query |

## New Hook API

```typescript
// src/hooks/useProducts.ts

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/api/product/user').then(r => r.data),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.get(`/api/product/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useProductsByCashier(cashierId: string) {
  return useQuery({
    queryKey: ['products', 'cashier', cashierId],
    queryFn: () => apiClient.get(`/api/product/cashier/${cashierId}`).then(r => r.data),
    enabled: !!cashierId,
  });
}

export function useUnassignedProducts() {
  return useQuery({
    queryKey: ['products', 'unassigned'],
    queryFn: () => apiClient.get('/api/product/unassigned').then(r => r.data),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.post('/api/product/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useEditProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      apiClient.patch(`/api/product/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/product/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useAssignCashierToProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, cashierId }: { productId: string; cashierId: string }) =>
      apiClient.patch(`/api/product/${productId}/assign`, { cashierId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['products', 'unassigned'] });
    },
  });
}
```

## Pages to update

- [ ] `src/app/products/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Products/InventoryManagement.tsx` — Replace `useEffect` fetch + `error` + `isLoading` states with `useProducts()` query
- [ ] `src/components/Products/CreateProduct.tsx` — Replace server action with `useCreateProduct()` mutation
- [ ] `src/components/Products/EditProduct.tsx` — Replace server action with `useEditProduct()` mutation
- [ ] `src/components/Products/DeleteProduct.tsx` — Replace server action with `useDeleteProduct()` mutation
- [ ] `src/components/Products/UnassignedProductsManager.tsx` — Replace `useEffect` fetch with `useUnassignedProducts()` query + `useAssignCashierToProduct()` mutation

## Special Considerations

- **File upload** — `createProduct.ts` uses `FormData`. The proxy must forward the `Content-Type: multipart/form-data` header. Axios will handle this automatically since we pass `FormData` as the body.
- **`cache: "no-cache"`** in old server actions — Tanstack Query handles this via `staleTime` and `refetchOnMount` options.

## Verification

- [ ] Product list loads
- [ ] Create product with image upload works
- [ ] Edit product works (including image change)
- [ ] Delete product works
- [ ] Assign cashier to product works
- [ ] Unassigned products list works
- [ ] Empty state shows "No products found"
- [ ] Error toast shows API error message
- [ ] Loading spinner shows during fetch
