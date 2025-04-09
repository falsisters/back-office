import { z } from "zod";

// Enums
export const CashierPermissionsEnum = z.enum([
  "SALES",
  "DELIVERIES",
  "STOCKS",
  "EDIT_PRICE",
  "KAHON",
  "PROFITS",
  "ATTACHMENTS",
  "SALES_HISTORY",
]);
export type CashierPermissions = z.infer<typeof CashierPermissionsEnum>;

export const SackTypeEnum = z.enum([
  "FIFTY_KG",
  "TWENTY_FIVE_KG",
  "FIVE_KG",
]);
export type SackType = z.infer<typeof SackTypeEnum>;

export const PaymentMethodEnum = z.enum([
  "CASH",
  "BANK_TRANSFER",
  "CHECK",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// Base Schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CashierSchema = z.object({
  id: z.string(),
  name: z.string(),
  accessKey: z.string(),
  secureCode: z.string(),
  permissions: z.array(CashierPermissionsEnum),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Cashier = z.infer<typeof CashierSchema>;

export const ShiftSchema = z.object({
  id: z.string(),
  startTime: z.date(),
  endTime: z.date().nullable(),
  cashierId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Shift = z.infer<typeof ShiftSchema>;

export const ShiftEmployeeSchema = z.object({
  id: z.string(),
  shiftId: z.string(),
  employeeId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ShiftEmployee = z.infer<typeof ShiftEmployeeSchema>;

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Employee = z.infer<typeof EmployeeSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: z.string().url(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Product = z.infer<typeof ProductSchema>;

export const SackPriceSchema = z.object({
  id: z.string(),
  price: z.number().positive(),
  stock: z.number().int().positive(),
  type: SackTypeEnum,
  profit: z.number().positive(),
  productId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SackPrice = z.infer<typeof SackPriceSchema>;

export const SpecialPriceSchema = z.object({
  id: z.string(),
  price: z.number().positive(),
  minimumQty: z.number().int().positive(),
  profit: z.number().positive(),
  sackPriceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SpecialPrice = z.infer<typeof SpecialPriceSchema>;

export const PerKiloPriceSchema = z.object({
  id: z.string(),
  price: z.number().positive(),
  stock: z.number().positive(),
  profit: z.number().positive(),
  productId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PerKiloPrice = z.infer<typeof PerKiloPriceSchema>;

export const SaleSchema = z.object({
  id: z.string(),
  cashierId: z.string(),
  totalAmount: z.number().positive(),
  paymentMethod: PaymentMethodEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Sale = z.infer<typeof SaleSchema>;

export const SaleItemSchema = z.object({
  id: z.string(),
  quantity: z.number().positive(),
  productId: z.string(),
  saleId: z.string(),
  isGantang: z.boolean(),
  isSpecialPrice: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SaleItem = z.infer<typeof SaleItemSchema>;

export const DeliverySchema = z.object({
  id: z.string(),
  driverName: z.string(),
  deliveryTimeStart: z.date(),
  cashierId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Delivery = z.infer<typeof DeliverySchema>;

export const DeliveryItemSchema = z.object({
  id: z.string(),
  quantity: z.number().positive(),
  productId: z.string(),
  deliveryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DeliveryItem = z.infer<typeof DeliveryItemSchema>;

export const KahonSchema = z.object({
  id: z.string(),
  name: z.string(),
  cashierId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Kahon = z.infer<typeof KahonSchema>;

export const InventorySchema = z.object({
  id: z.string(),
  name: z.string(),
  cashierId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Inventory = z.infer<typeof InventorySchema>;

export const KahonItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  kahonId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type KahonItem = z.infer<typeof KahonItemSchema>;

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  inventoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;