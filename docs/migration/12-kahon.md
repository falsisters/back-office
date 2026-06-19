# Kahon (Spreadsheet) Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Kahon/getInventorySheets.ts` | `useInventorySheets` query |
| `src/lib/server/Kahon/getKahonSheets.ts` | `useKahonSheets` + `useSheet` + `useSheetByCashier` queries |
| `src/lib/server/Kahon/manageCells.ts` | `useCell` mutations (create, update, delete, batch) |
| `src/lib/server/Kahon/manageInventoryRows.ts` | `useInventoryRow` mutations |
| `src/lib/server/Kahon/manageKahonRows.ts` | `useKahonRow` mutations |

## New Hook API

```typescript
// src/hooks/useKahon.ts

// --- Sheets ---
export function useKahonSheets(params?: DateRangeQueryType) {
  return useQuery({
    queryKey: ['kahon', 'sheets', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);
      return apiClient.get(`/api/sheet/user/date?${searchParams}`).then(r => r.data);
    },
  });
}

export function useSheet(sheetId: string) {
  return useQuery({
    queryKey: ['kahon', 'sheet', sheetId],
    queryFn: () => apiClient.get(`/api/sheet/user/${sheetId}`).then(r => r.data),
    enabled: !!sheetId,
  });
}

export function useSheetByCashier(cashierId: string) {
  return useQuery({
    queryKey: ['kahon', 'sheet', 'cashier', cashierId],
    queryFn: () => apiClient.get(`/api/sheet/user/cashier/${cashierId}`).then(r => r.data),
    enabled: !!cashierId,
  });
}

export function useInventorySheets(params?: DateRangeQueryType) {
  return useQuery({
    queryKey: ['inventory', 'sheets', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);
      return apiClient.get(`/api/inventory/date?${searchParams}`).then(r => r.data);
    },
  });
}

// --- Rows ---
export function useCreateKahonRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRowType) =>
      apiClient.post('/api/sheet/calculation-row', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

export function useBatchCreateKahonRows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: CreateRowType[]) =>
      apiClient.post('/api/sheet/calculation-rows', rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

export function useDeleteKahonRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowId: string) =>
      apiClient.delete(`/api/sheet/row/${rowId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

// --- Cells ---
export function useCreateCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCellType) =>
      apiClient.post('/api/sheet/cell', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

export function useUpdateCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cellId, data }: { cellId: string; data: UpdateCellType }) =>
      apiClient.patch(`/api/sheet/cell/${cellId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

export function useDeleteCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cellId: string) =>
      apiClient.delete(`/api/sheet/cell/${cellId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

export function useBatchUpdateCells() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cells: UpdateCellType[]) =>
      apiClient.patch('/api/sheet/cells', cells),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

export function useBatchCreateCells() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cells: CreateCellType[]) =>
      apiClient.post('/api/sheet/cells', cells),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}

// --- Reorder ---
export function useReorderRows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mappings: ReorderMappings) =>
      apiClient.post('/api/sheet/reorder/comprehensive', mappings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kahon'] }),
  });
}
```

## Pages to update

- [ ] `src/app/kahon/` pages → Add `"use client"`, use hooks

## Components to update

- [ ] All Kahon spreadsheet components — Replace server action calls with Tanstack Query hooks
- [ ] Inventory spreadsheet components — Same pattern

## Special Considerations

This is the **most complex domain** due to the spreadsheet functionality (Syncfusion ej2-spreadsheet). The syncfusion component likely expects data in a specific format and calls server actions for save/load operations. Migration requires:

1. Understanding how Syncfusion spreadsheet initializes (what data it expects)
2. Wrapping save/load operations in Tanstack Query mutations/queries
3. Handling optimistic updates for cell edits

**Approach:** Keep the Syncfusion spreadsheet component logic as-is, but replace the data fetching/saving layer. The spreadsheet component should receive data from hooks and call mutation functions for saves.

## Verification

- [ ] Kahon sheet loads by date range
- [ ] Cells render correctly
- [ ] Cell edit saves to backend
- [ ] Row add/delete works
- [ ] Batch operations work
- [ ] Reorder works with formula updates
- [ ] Inventory sheets load by date
- [ ] Empty sheet state handled
- [ ] Error toast shows API error message
