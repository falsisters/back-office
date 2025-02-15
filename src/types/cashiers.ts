export interface Cashier {
    id: string
    name: string
    accessKey: string
    secureCode: string
    permissions: CashierPermission[]
  }
  
  export interface CashierPermission {
    id: string
    name: CashierPermissionType
  }
  
  export enum CashierPermissionType {
    PRICES = "PRICES",
    DELIVERIES = "DELIVERIES",
    STOCKS = "STOCKS",
    PROFITS = "PROFITS",
    KAHON = "KAHON",
    SALES_CHECK = "SALES_CHECK",
    SALES_HISTORY = "SALES_HISTORY",
  }