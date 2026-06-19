# Storage Migration

## Current files to replace

| Old (server action) | New (hook) |
|----------------------|------------|
| `src/lib/server/Storage/index.ts` | `useStorage` hooks (shared with Stocks) |

## New Hook API

Already defined in `11-stocks-transfers.md`:

- `useStorageUsage()` — query for storage size
- `useExportStorage()` — mutation to trigger export
- `useClearStorage()` — mutation to clear storage

## Components to update

Storage data is displayed in the Stocks/Storage management UI. No separate page exists.

## Verification

- [ ] Storage usage displays in MB/GB
- [ ] Export storage downloads a file
- [ ] Clear storage clears and refreshes usage
- [ ] Error toast shows API error message
