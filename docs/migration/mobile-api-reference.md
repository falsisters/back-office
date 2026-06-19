# Mobile App API Reference (DO NOT BREAK)

The mobile app (Flutter) hits the NestJS backend directly via Dio. These endpoints must remain functional throughout the migration. The proxy route is only for the backoffice.

**Backend:** `https://falsisters-server.vercel.app`

## Auth

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/cashier/login` | Login (body: `{ name, accessKey }`) |
| `GET` | `/cashier` | Get current cashier info |

> Note: Mobile app uses `/cashier/login`, NOT `/auth/login`. The backoffice uses `/auth/login`. Different endpoints.

## Sales

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/sale/create` | Create a sale |
| `GET` | `/sale/recent/cashier` | Get recent sales (`?date=`) |
| `DELETE` | `/sale/{id}` | Delete a sale |

## Products

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/product/cashier` | Get all products for cashier |
| `GET` | `/product/{id}` | Get product by ID |
| `PATCH` | `/product/{id}` | Edit sack price or per-kilo price (FormData) |

## Expenses

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/expenses/today` | Get today's expenses (`?date=`) |
| `POST` | `/expenses/create` | Create expense |
| `PUT` | `/expenses/update/{id}` | Update expense |
| `DELETE` | `/expenses/{id}` | Delete expense |

## Profits

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/profit/cashier` | Get profits by cashier |

## Sales Check

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/sales-check/cashier` | Get grouped sales check |
| `GET` | `/sales-check/cashier/total` | Get total sales check |

## Kahon (Spreadsheet)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/sheet/date` | Get sheet by date range (`?startDate=&endDate=`) |
| `POST` | `/sheet/calculation-row` | Create calculation row |
| `POST` | `/sheet/calculation-rows` | Batch create calculation rows |
| `DELETE` | `/sheet/row/{rowId}` | Delete a row |
| `POST` | `/sheet/cell` | Create cell |
| `PATCH` | `/sheet/cell/{cellId}` | Update cell |
| `DELETE` | `/sheet/cell/{cellId}` | Delete cell |
| `PATCH` | `/sheet/cells` | Batch update cells |
| `POST` | `/sheet/cells` | Batch create cells |
| `PATCH` | `/sheet/user/rows/positions` | Update row position |
| `PATCH` | `/sheet/rows/positions/batch` | Batch update row positions |
| `PATCH` | `/sheet/cells/formulas/batch` | Batch update cell formulas |
| `POST` | `/sheet/reorder/comprehensive` | Comprehensive row reorder with formula updates |
| `POST` | `/sheet/reorder/validate` | Validate reorder mappings |

## Inventory

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/inventory/expenses/date` | Get expenses sheet by date |
| `GET` | `/inventory/date` | Get inventory sheet by date |
| `POST` | `/inventory/calculation-row` | Create calculation row |
| `POST` | `/inventory/calculation-rows` | Batch create calculation rows |
| `DELETE` | `/inventory/row/{rowId}` | Delete row |
| `POST` | `/inventory/cell` | Create cell |
| `PATCH` | `/inventory/cell/{cellId}` | Update cell |
| `DELETE` | `/inventory/cell/{cellId}` | Delete cell |
| `PATCH` | `/inventory/cells` | Batch update cells |
| `POST` | `/inventory/cells` | Batch create cells |
| `PATCH` | `/inventory/user/rows/positions` | Update row position |
| `PATCH` | `/inventory/rows/positions/batch` | Batch update row positions |
| `PATCH` | `/inventory/cells/formulas/batch` | Batch update cell formulas |
| `POST` | `/inventory/rows/validate` | Validate row mappings |

## Stocks & Transfers

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/transfer/product` | Transfer stock between products |
| `GET` | `/transfer/cashier` | Get transfers |
| `GET` | `/transfer/cashier/date` | Get transfers by date (`?date=`) |
| `GET` | `/stock/statistics/cashier` | Get stock stats (`?date=`) |

## Orders

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/order/cashier` | Get all orders |
| `PATCH` | `/order/cancel/{orderId}` | Cancel an order |
| `GET` | `/order/cashier/{id}` | Get order by ID |

## Shift

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/shift/cashier` | Get shifts |
| `POST` | `/shift/end/{shiftId}` | End a shift |
| `GET` | `/employee/cashier` | Get employees for cashier |
| `POST` | `/shift/create` | Create shift (`{ employees: [...] }`) |
| `PATCH` | `/shift/{shiftId}` | Edit shift (`{ employees: [...] }`) |

## Deliveries

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/delivery/create` | Create delivery |

## Bill Count

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/bills` | Get bill count (`?date=`) |
| `POST` | `/bills` | Create or update (upsert) |
| `PUT` | `/bills/{id}` | Update bill by ID |
| `GET` | `/bills/{id}` | Get bill by ID |
| `GET` | `/bills/payment-summary` | Get payment totals (`?date=`) |

## Attachments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/attachment/create` | Upload attachment (multipart FormData) |
| `GET` | `/attachment` | Get all attachments |
| `GET` | `/attachment/{id}` | Get attachment by ID |
| `PUT` | `/attachment/{id}` | Edit attachment metadata |
| `DELETE` | `/attachment/{id}` | Delete attachment |

## Mobile App Architecture Notes

- **HTTP Client:** Singleton `DioClient` with 3 interceptors (logging, idempotency, JWT Bearer injection + 401 auto-logout)
- **Auth:** JWT stored in `FlutterSecureStorage`, injected via interceptor on every request
- **Offline-First:** Outbox pattern with local SQLite, periodic sync every 30 seconds
- **State:** Riverpod `AsyncNotifier` pattern
- **Key difference from backoffice:** Mobile app logs in as a `cashier` (not `user`), uses different auth endpoints and different permissions model. The backoffice uses admin-level endpoints under `/auth/login` and `/auth/register`.
