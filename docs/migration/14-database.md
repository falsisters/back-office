# Database Export/Delete Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/exportDatabase.ts` | `useExportDatabase` mutation (in `useStorage.ts` or standalone) |
| `src/lib/server/deleteDatabase.ts` | `useDeleteDatabase` mutation |

## New Hook API

```typescript
// src/hooks/useStorage.ts (add these)

export function useExportDatabase() {
  return useMutation({
    mutationFn: () => apiClient.get('/api/storage/db-export'),
  });
}

export function useDeleteDatabase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete('/api/storage/db-delete'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['storage'] }),
  });
}
```

## Components to update

These are likely called from admin/settings UI. Identify the component(s) that import `exportDatabase` and `deleteDatabase`.

## Verification

- [ ] Export database downloads a file
- [ ] Delete database requires confirmation
- [ ] Error toast shows API error message
