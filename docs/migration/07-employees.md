# Employees Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Employee/addEmployee.ts` | `useCreateEmployee` mutation |
| `src/lib/server/Employee/deleteEmployee.ts` | `useDeleteEmployee` mutation |
| `src/lib/server/Employee/editEmployee.ts` | `useEditEmployee` mutation |
| `src/lib/server/Employee/getEmployee.ts` | `useEmployees` + `useEmployee` queries |
| `src/lib/server/Employee/getEmployeeAttendance.ts` | `useEmployeeAttendance` query |

## New Hook API

```typescript
// src/hooks/useEmployees.ts

export function useEmployees(filters?: EmployeeFilter) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.branch) params.append('branch', filters.branch);
      return apiClient.get(`/api/employee/user?${params}`).then(r => r.data);
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => apiClient.get(`/api/employee/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useEmployeeAttendance(id: string) {
  return useQuery({
    queryKey: ['employees', id, 'attendance'],
    queryFn: () => apiClient.get(`/api/employee/${id}/attendance`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeType) =>
      apiClient.post('/api/employee/create', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useEditEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditEmployeeType }) =>
      apiClient.patch(`/api/employee/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/employee/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}
```

## Pages to update

- [ ] `src/app/employees/page.tsx` → Add `"use client"`, use `useAuth()` for auth gate
- [ ] `src/app/employees/[id]/page.tsx` → Add `"use client"`, use `useEmployee()` + `useEmployeeAttendance()`

## Components to update

- [ ] `src/components/Employees/EmployeeCard.tsx` — Replace server action with `useDeleteEmployee()` mutation. Already uses sonner toast (no change needed).
- [ ] `src/components/Employees/CreateNewEmployee.tsx` — Replace server action with `useCreateEmployee()` mutation. Already uses sonner toast.

## Note

Employee components already use sonner toast — this domain is ahead of the standardization effort.

## Verification

- [ ] Employee list loads
- [ ] Filter by branch works
- [ ] Create employee — success toast, list refreshes
- [ ] Edit employee works
- [ ] Delete employee — success toast, list refreshes
- [ ] Employee detail page loads with attendance data
- [ ] 404 employee returns null (no crash)
- [ ] Error toast shows API error message
