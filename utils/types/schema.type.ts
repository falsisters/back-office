import { Upload } from "lucide-react";
import { z } from "zod";

// Enums
export const UserPermissionTypeEnum = z.enum(["READ", "WRITE", "DELETE"]);
export type UserPermissionType = z.infer<typeof UserPermissionTypeEnum>;

export const CashierPermissionTypeEnum = z.enum([
  "PRICES",
  "DELIVERIES",
  "STOCKS",
  "PROFITS",
  "KAHON",
  "SALES_CHECK",
  "SALES_HISTORY",
]);
export type CashierPermissionType = z.infer<typeof CashierPermissionTypeEnum>;

export const ProductTypeEnum = z.enum([
  "FIFTY_KG",
  "TWENTY_FIVE_KG",
  "FIVE_KG",
  "PER_KILO",
  "GANTANG",
]);
export type ProductType = z.infer<typeof ProductTypeEnum>;

export const PaymentMethodEnum = z.enum(["CASH", "BANK_TRANSFER", "CHECK"]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const TransferTypeEnum = z.enum([
  "OWN_CONSUMPTION",
  "RETURN_TO_WAREHOUSE",
  "REPACK",
]);
export type TransferType = z.infer<typeof TransferTypeEnum>;

export const OperationTypeEnum = z.enum([
  "ADDITION",
  "SUBTRACTION",
  "MULTIPLICATION",
  "DIVISION",
  "TOTAL",
]);
export type OperationType = z.infer<typeof OperationTypeEnum>;

export const BillEnum = z.enum([
  "thousand",
  "fiveHundred",
  "twoHundred",
  "oneHundred",
  "fifty",
  "twenty",
  "coins",
]);
export type Bill = z.infer<typeof BillEnum>;


// Models
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

export const UserPermissionSchema = z.object({
  id: z.string(),
  name: UserPermissionTypeEnum,
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type UserPermission = z.infer<typeof UserPermissionSchema>;

export const CashierSchema = z.object({
  id: z.string(),
  name: z.string(),
  accessKey: z.string(),
  secureCode: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Cashier = z.infer<typeof CashierSchema>;

export const CashierPermissionSchema = z.object({
  id: z.string(),
  name: CashierPermissionTypeEnum,
  cashierId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CashierPermission = z.infer<typeof CashierPermissionSchema>;

export const ShiftSchema = z.object({
  id: z.string(),
  cashierId: z.string(),
  employee: z.string(),
  clockIn: z.date(),
  clockOut: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Shift = z.infer<typeof ShiftSchema>;

export const UploadSchema = z.object({
  fileName: z.string(),
  path: z.string(),
  file: z.instanceof(File), 
});
export type Upload = z.infer<typeof UploadSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: UploadSchema,
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;


export const SpecialPriceSchema = z.object({
  id: z.string(),
  specialPrice: z.number(),
  minimumQty: z.number(),
  priceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type SpecialPrice = z.infer<typeof SpecialPriceSchema>

export const ProfitSchema = z.object({
  id: z.string(),
  profit: z.number(),
  priceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Profit = z.infer<typeof ProfitSchema>;

export const PriceSchema = z.object({
  id: z.string(),
  price: z.number(),
  stock: z.number(),
  type: ProductTypeEnum,
  productId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  profit: z.array(ProfitSchema), 
  specialPrice: z.array(SpecialPriceSchema),
});
export type Price = z.infer<typeof PriceSchema>;

export const SaleSchema = z.object({
  id: z.string(),
  cashierId: z.string(),
  total: z.number(),
  paymentMethod: PaymentMethodEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Sale = z.infer<typeof SaleSchema>;

export const SaleItemSchema = z.object({
  id: z.string(),
  saleId: z.string(),
  productId: z.string(),
  qty: z.number(),
  price: z.number(),
  isSpecialPrice: z.boolean(),
  type: ProductTypeEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SaleItem = z.infer<typeof SaleItemSchema>;

export const DeliverySchema = z.object({
  id: z.string(),
  cashierId: z.string(),
  total: z.number(),
  driver: z.string(),
  isFinished: z.boolean(),
  timeFinished: z.date(),
  attachments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Delivery = z.infer<typeof DeliverySchema>;

export const DeliveryItemSchema = z.object({
  id: z.string(),
  deliveryId: z.string(),
  productId: z.string(),
  type: ProductTypeEnum,
  qty: z.number(),
  price: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DeliveryItem = z.infer<typeof DeliveryItemSchema>;

export const TransferSchema = z.object({
  id: z.string(),
  productId: z.string(),
  attachments: z.array(z.string()),
  qty: z.number(),
  type: TransferTypeEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Transfer = z.infer<typeof TransferSchema>;

export const KahonSchema = z.object({
  id: z.string(),
  cashierId: z.string(),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Kahon = z.infer<typeof KahonSchema>;

export const KahonStockSchema = z.object({
  id: z.string(),
  qty: z.number(),
  productId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type KahonStock = z.infer<typeof KahonStockSchema>;

export const KahonStockModifierSchema = z.object({
  id: z.string(),
  index: z.number(),
  operation: OperationTypeEnum,
  kahonStockId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type KahonStockModifier = z.infer<typeof KahonStockModifierSchema>;

export const KahonTotalModifierSchema = z.object({
  id: z.string(),
  index: z.number(),
  operation: OperationTypeEnum,
  kahonId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type KahonTotalModifier = z.infer<typeof KahonTotalModifierSchema>;

export const ExpenseSchema = z.object({
  id: z.string(),
  cashierId: z.string(),
  description: z.string(),
  price: z.number(),
  attachments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

export const CashBreakdownSchema = z.object({
  id: z.string(),
  initialBalance: z.number(),
  cashierId: z.string(),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CashBreakdown = z.infer<typeof CashBreakdownSchema>;

export const CashBreakdownItemSchema = z.object({
  id: z.string(),
  cashBreakdownId: z.string(),
  bill: BillEnum,
  qty: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CashBreakdownItem = z.infer<typeof CashBreakdownItemSchema>;
