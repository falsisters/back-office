# Migration: Server Actions → Tanstack Query + Proxy API Routes

## Why

- **Errors are hidden in production.** Next.js masks server action errors as "Server Component returned error" instead of showing the actual message.
- **62+ server action files** each copy-paste the same auth token reading, error handling, and fetch boilerplate.
- **No centralized HTTP layer** — no base URL, no retry logic, no request/response interceptors.
- **Inconsistent error parsing** across files (some use `Array.isArray()`, some `.toString()`, some pass through).
- **No caching, no optimistic updates, no loading states** at the data layer.

## Architecture

```
Client (Browser)
 ├── Domain Hooks (useCashiers, useSales, useProducts, ...)
 │    └── @tanstack/react-query (useQuery / useMutation)
 │         └── Axios Instance (baseURL: /api, no auth logic)
 │
Server (Next.js)
 ├── /api/[...path]/route.ts  ← Proxy Route
 │    ├── Reads access_token from HTTP-only cookie
 │    ├── Forwards request to NestJS backend with Bearer token
 │    └── Returns response to client
 │
Backend (NestJS)
 └── falsisters-server.vercel.app (unchanged)
```

- Client never sees the backend URL or the access token.
- Proxy handles auth, client handles UX (loading/error/caching).
- Old server actions are **kept during migration** and deleted only after the feature is verified.
- Mobile app is **untouched** — it hits the NestJS backend directly via Dio.

## Checklist

### Phase 0: Infrastructure (No feature impact)

- [x] 0.1 Install dependencies (`axios`, `@tanstack/react-query`, `@tanstack/react-query-devtools`)
- [x] 0.2 Create `src/lib/api/client.ts` — Axios instance
- [x] 0.3 Create `src/lib/api/query-provider.tsx` — Tanstack Query provider
- [x] 0.4 Create `src/lib/api/types.ts` — Shared types
- [x] 0.5 Create `src/app/api/[...path]/route.ts` — Proxy API route
- [x] 0.6 Integrate `QueryProvider` into root layout
- [x] 0.7 Run lint + build to verify zero regressions

### Phase 1: Auth (Pilot)

- [x] 1.1 Create `src/hooks/useAuth.ts`
- [x] 1.2 Fix register cookie bug (`"token"` → `"access_token"`)
- [x] 1.3 Rewrite `LoginForm.tsx` → use `useLogin` mutation
- [x] 1.4 Rewrite `RegisterForm.tsx` → use `useRegister` mutation
- [x] 1.5 Rewrite `LogoutButton.tsx` → use `useLogout` mutation
- [x] 1.6 Update `layout.tsx` → use `useUser` for auth gate
- [x] 1.7 Delete old `src/lib/server/login.ts`
- [x] 1.8 Delete old `src/lib/server/register.ts`
- [x] 1.9 Delete old `src/lib/server/logout.ts`
- [x] 1.10 Delete old `src/lib/server/getUserData.ts`
- [x] 1.11 Verify: login → sidebar visible → logout → redirected

### Phase 2: Cashiers

- [x] 2.1 Create `src/hooks/useCashiers.ts`
- [x] 2.2 Rewrite `src/app/cashiers/page.tsx` → client component
- [x] 2.3 Rewrite `CashierList.tsx` → use `useCashiers` query
- [x] 2.4 Rewrite `CreateCashier.tsx` → use `useCreateCashier` mutation
- [x] 2.5 Rewrite `EditCashier.tsx` → use `useEditCashier` mutation
- [x] 2.6 Rewrite `CashierSelector.tsx` → use `useCashiers` query
- [x] 2.7 Rewrite `DeleteConfirmDialog.tsx` → use `useDeleteCashier` mutation (UI only, no changes needed)
- [x] 2.8 Delete old server actions (6 files)
- [x] 2.9 Verify: list, create, edit, delete cashiers

### Phase 3: Sales

- [x] 3.1 Create `src/hooks/useSales.ts`
- [x] 3.2 Rewrite `src/app/sales/page.tsx` → client component (no changes needed, already client)
- [x] 3.3 Rewrite `SalesList.tsx` → use `useSales` query
- [x] 3.4 Rewrite `CashierSalesList.tsx` → use `useSalesByCashier` query
- [x] 3.5 Rewrite `CashierSalesListNew.tsx` → use `useSalesCheckByCashier` + `useTotalSalesByCashier` queries
- [x] 3.6 Rewrite `VoidList.tsx` → use `useVoidedSales` query
- [x] 3.7 Rewrite `ProfitTracker.tsx` → (no changes, presentational component)
- [x] 3.8 Delete old server actions (5 files)
- [x] 3.9 Verify: sales list, filter by cashier, voided sales, profit tracker

### Phase 4: Products

- [x] 4.1 Create `src/hooks/useProducts.ts`
- [x] 4.2 Rewrite `src/app/products/page.tsx` → client component
- [x] 4.3 Rewrite `InventoryManagement.tsx` → use `useProducts` query
- [x] 4.4 Rewrite `CreateProduct.tsx` → use `useCreateProduct` mutation
- [x] 4.5 Rewrite `EditProduct.tsx` → use `useEditProduct` mutation
- [x] 4.6 Rewrite `DeleteProduct.tsx` → use `useDeleteProduct` mutation
- [x] 4.7 Rewrite `UnassignedProductsManager.tsx` → use hooks
- [x] 4.8 Update `SackPricesManager.tsx` shadcn toast → sonner
- [x] 4.9 Delete old server actions (9 files)
- [x] 4.10 Verify: product CRUD, assign cashier, unassigned products

### Phase 5: Expenses

- [x] 5.1 Create `src/hooks/useExpenses.ts`
- [x] 5.2 Rewrite `src/app/expenses/page.tsx` → client component
- [x] 5.3 Rewrite `ExpenseList.tsx` → use `useExpenses` query
- [x] 5.4 Rewrite `CreateExpense.tsx` → use `useCreateExpense` mutation
- [x] 5.5 Rewrite `ExpenseItem.tsx` → use `useDeleteExpense` mutation (no changes needed, onDelete callback pattern)
- [x] 5.6 Delete old server actions (8 files)
- [x] 5.7 Verify: expense list, create, delete

### Phase 6: Profits

- [x] 6.1 Create `src/hooks/useProfits.ts`
- [x] 6.2 Rewrite `src/app/profits/page.tsx` → client component
- [x] 6.3 Rewrite `CashierProfitList.tsx` → use `useProfits` query
- [x] 6.4 Delete old server action (1 file)
- [x] 6.5 Verify: profit list per cashier

### Phase 7: Employees

- [x] 7.1 Create `src/hooks/useEmployees.ts`
- [x] 7.2 Rewrite `src/app/employees/page.tsx` → client component
- [x] 7.3 Rewrite `src/app/employees/[id]/page.tsx` → client component
- [x] 7.4 Rewrite `EmployeeCard.tsx` → use hooks
- [x] 7.5 Rewrite `CreateNewEmployee.tsx` → use hooks
- [x] 7.6 Delete old server actions (5 files)
- [x] 7.7 Verify: employee list, create, edit, delete, attendance

### Phase 8: Attachments

- [x] 8.1 Create `src/hooks/useAttachments.ts`
- [x] 8.2 Rewrite `src/app/attachments/page.tsx` → client component
- [x] 8.3 Rewrite `AttachmentList.tsx` → use `useAttachments` query
- [x] 8.4 Rewrite `CreateAttachments.tsx` → use `useCreateAttachment` mutation
- [x] 8.5 Rewrite `EditAttachments.tsx` → use `useEditAttachment` mutation
- [x] 8.6 Delete old server actions (5 files)
- [x] 8.7 Verify: attachment CRUD, file upload

### Phase 9: Deliveries

- [x] 9.1 Create `src/hooks/useDeliveries.ts`
- [x] 9.2 Rewrite `src/app/deliveries/page.tsx` → client component
- [x] 9.3 Rewrite `DeliveryList.tsx` → use hooks
- [x] 9.4 Rewrite `CashierDeliveryList.tsx` → DELETED (dead code, never imported)
- [x] 9.5 Rewrite `DeliveryItem.tsx` → use hooks (fix `alert()` → toast)
- [x] 9.6 Delete old server actions (6 files)
- [x] 9.7 Verify: delivery list, create, delete, filter by cashier

### Phase 10: Bill Counts

- [x] 10.1 Create `src/hooks/useBillCounts.ts`
- [x] 10.2 Rewrite `BillsList.tsx` → use hooks
- [x] 10.3 Rewrite `CreateBillCount.tsx` → use hooks
- [x] 10.4 Rewrite `EditBillCount.tsx` → use hooks
- [x] 10.5 Delete old server actions (8 files)
- [x] 10.6 Verify: bill count CRUD, filter by date

### Phase 11: Stocks & Transfers

- [x] 11.1 Create `src/hooks/useStocks.ts`
- [x] 11.2 Rewrite `src/app/stocks/page.tsx` → client component
- [x] 11.3 Rewrite `StocksManagement.tsx` → use hooks
- [x] 11.4 Rewrite `TransferHistory.tsx` → use hooks
- [x] 11.5 Delete old server actions (4 files)
- [x] 11.6 Verify: stock stats, transfers list, filter by cashier/date

### Phase 12: Kahon (Spreadsheet)

- [x] 12.1 Create `src/hooks/useKahon.ts`
- [x] 12.2 Rewrite `src/app/kahon/` pages → client components
- [x] 12.3 Rewrite Kahon components → use hooks
- [x] 12.4 Delete old server actions (5 files)
- [x] 12.5 Verify: sheet CRUD, cells, rows, formulas

### ~~Phase 13: Storage~~ REMOVED

- [x] 13.1 Delete `src/app/usage/page.tsx`
- [x] 13.2 Delete `src/components/Usage/` (ClearStorage, ExportDatabase, UsageCard)
- [x] 13.3 Delete `src/lib/server/Storage/index.ts`
- [x] 13.4 Remove "Usage" link from sidebar

### ~~Phase 14: Database Export/Delete~~ REMOVED

- [x] 14.1 Delete `src/lib/server/exportDatabase.ts`
- [x] 14.2 Delete `src/lib/server/deleteDatabase.ts`

### Phase 15: Cleanup

- [x] 15.1 Delete all remaining files in `src/lib/server/`
- [x] 15.2 Delete shadcn `use-toast.ts` hook (replace with sonner)
- [x] 15.3 Replace shadcn `Toaster` with sonner `Toaster` in layout
- [x] 15.4 Replace all remaining shadcn toast usages with sonner
- [x] 15.5 Replace any remaining `alert()` calls with sonner toast
- [x] 15.6 Add React Error Boundary at route group level
- [x] 15.7 Add Suspense boundaries for lazy-loading
- [x] 15.8 Remove `experimental.serverActions` from `next.config.ts`
- [x] 15.9 Run full build (`yarn build`) — zero errors
- [x] 15.10 Mobile app unaffected (uses Dio directly to NestJS)
- [x] 15.11 Verify mobile app still works (no regression)

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done and verified |
| `[!]` | Blocked |
