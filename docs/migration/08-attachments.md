# Attachments Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Attachment/createAttachment.ts` | `useCreateAttachment` mutation |
| `src/lib/server/Attachment/deleteAttachment.ts` | `useDeleteAttachment` mutation |
| `src/lib/server/Attachment/editAttachment.ts` | `useEditAttachment` mutation |
| `src/lib/server/Attachment/getAllAttachments.ts` | `useAttachments` query |
| `src/lib/server/Attachment/getAttachmentById.ts` | `useAttachment` query |

## New Hook API

```typescript
// src/hooks/useAttachments.ts

export function useAttachments() {
  return useQuery({
    queryKey: ['attachments'],
    queryFn: () => apiClient.get('/api/attachment/user').then(r => r.data),
  });
}

export function useAttachment(id: string) {
  return useQuery({
    queryKey: ['attachments', id],
    queryFn: () => apiClient.get(`/api/attachment/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.post('/api/attachment/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments'] }),
  });
}

export function useEditAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      apiClient.put(`/api/attachment/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments'] }),
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/attachment/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments'] }),
  });
}
```

## Pages to update

- [ ] `src/app/attachments/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate

## Components to update

- [ ] `src/components/Attachments/AttachmentList.tsx` — Replace `useEffect` fetch + `error` + `isLoading` states with `useAttachments()` query
- [ ] `src/components/Attachments/CreateAttachments.tsx` — Replace server action with `useCreateAttachment()` mutation
- [ ] `src/components/Attachments/EditAttachments.tsx` — Replace server action with `useEditAttachment()` mutation

## Verification

- [ ] Attachment list loads
- [ ] Create attachment with file upload works
- [ ] Edit attachment metadata works
- [ ] Delete attachment — success toast, list refreshes
- [ ] Empty state shows "No attachments found"
- [ ] Error toast shows API error message
- [ ] Loading spinner shows during fetch
