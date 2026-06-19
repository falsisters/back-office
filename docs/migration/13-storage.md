# Storage → REMOVED

**Status:** This feature is being removed entirely. No migration needed.

## Files to delete

- `src/app/usage/page.tsx`
- `src/components/Usage/ClearStorage.tsx`
- `src/components/Usage/ExportDatabase.tsx`
- `src/components/Usage/UsageCard.tsx`
- `src/lib/server/Storage/index.ts`
- `src/lib/server/exportDatabase.ts`
- `src/lib/server/deleteDatabase.ts`

## Sidebar / Navigation

Remove the "Usage" link from `src/components/Sidebar.tsx`.

## Backend endpoints (no longer called)

- `GET /storage/usage`
- `GET /storage/export`
- `DELETE /storage/clear`
- `GET /storage/db-export`
- `DELETE /storage/db-delete`
