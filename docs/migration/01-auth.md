# Auth Migration

## Bugs to Fix

- **`register.ts:33`** — Stores token as `"token"` instead of `"access_token"`. Every other server action reads `"access_token"`, so registering via the current code and then navigating to any feature page will fail with "Unauthorized".
- **`login.ts:38`** — Uses `(await cookieStore)` pattern (awaiting after already calling `cookies()` without await). Inconsistent.

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/login.ts` | `POST /api/auth/login` via `useLogin` mutation |
| `src/lib/server/register.ts` | `POST /api/auth/register` via `useRegister` mutation |
| `src/lib/server/logout.ts` | `POST /api/auth/logout` via `useLogout` mutation |
| `src/lib/server/getUserData.ts` | `GET /api/auth` via `useUser` query |

## New Hook API

```typescript
// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const user = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => apiClient.get('/api/auth').then(r => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const login = useMutation({
    mutationFn: (data: LoginFormData) =>
      apiClient.post('/api/auth/login', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      router.push('/');
    },
  });

  const register = useMutation({
    mutationFn: (data: RegisterFormData) =>
      apiClient.post('/api/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      router.push('/');
    },
  });

  const logout = useMutation({
    mutationFn: () => apiClient.post('/api/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user: user.data ?? null,
    isLoading: user.isLoading,
    isAuthenticated: !!user.data,
    login,
    register,
    logout,
  };
}
```

## Pages to update

- [ ] `src/app/login/page.tsx` — Remove `getUserData` call, become client component, use `useAuth().isAuthenticated`
- [ ] `src/app/register/page.tsx` — Remove `getUserData` call, become client component, use `useAuth().isAuthenticated`
- [ ] `src/app/layout.tsx` — Use `useAuth()` for sidebar conditional rendering

## Components to update

- [ ] `src/components/Login/LoginForm.tsx` — Replace `login` server action import with `useAuth().login`
- [ ] `src/components/Register/RegisterForm.tsx` — Replace `register` server action import with `useAuth().register`
- [ ] `src/components/LogoutButton.tsx` — Replace `logout` server action import with `useAuth().logout`

## Proxy route behavior

The proxy handles the cookie setting/deletion server-side:

| Client request | Proxy action |
|---------------|--------------|
| `POST /api/auth/login` | Forward to `{API_URL}/auth/login`, set `access_token` + `name` + `permissions` cookies |
| `POST /api/auth/register` | Forward to `{API_URL}/auth/register`, set `access_token` + `name` cookies |
| `POST /api/auth/logout` | Delete `access_token` + `name` + `permissions` cookies |
| `GET /api/auth` | Forward to `{API_URL}/auth` with Bearer token from cookie |

## Verification

- [ ] Login: submit form → cookie set → redirected to `/` → sidebar visible
- [ ] Register: submit form → cookie set → redirected to `/` → sidebar visible
- [ ] Logout: click logout → cookies deleted → redirected to `/login`
- [ ] Refresh on `/cashiers` → stays on `/cashiers` (not redirected to login)
- [ ] Error toast: invalid credentials → toast shows error message (not "Server Component returned error")
