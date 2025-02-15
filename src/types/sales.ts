export enum PaymentMethod {
    CASH = "CASH",
    BANK_TRANSFER = "BANK_TRANSFER",
    CHECK = "CHECK"
  }
  
  export interface SaleItem {
    id: string;
    productId: string;
    qty: number;
    price: number;
  }
  
  export interface Sale {
    id: string;
    cashierId: string;
    total: number;
    paymentMethod: PaymentMethod;
    createdAt: Date;
    updatedAt: Date;
    items: SaleItem[];
  }
  