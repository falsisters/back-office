import { z } from "zod";
import { Decimal } from "decimal.js";

// Helper function to transform string to Decimal for validation
const decimalSchema = z
  .union([z.number(), z.string(), z.instanceof(Decimal)])
  .transform((val) => {
    if (val instanceof Decimal) return val;
    return new Decimal(val);
  });

// Helper functions to create validated decimal parsers
const createParseDecimal = (validation?: z.ZodNumber) => {
  const baseSchema = validation || z.number();
  return z
    .union([baseSchema, z.string(), z.instanceof(Decimal)])
    .transform((val) => {
      if (typeof val === "string") return parseFloat(val);
      if (val instanceof Decimal) return val.toNumber();
      return val;
    });
};

// Base parseDecimal without validation
const parseDecimal = createParseDecimal();

// Specific validation helpers
const parseDecimalPositive = createParseDecimal(z.number().positive());
const parseDecimalMin = (min: number) =>
  createParseDecimal(z.number().min(min));
const parseDecimalInt = createParseDecimal(z.number().int());
const parseDecimalIntMin = (min: number) =>
  createParseDecimal(z.number().int().min(min));

export const CashierPermissionsEnum = z.enum([
  "SALES",
  "DELIVERIES",
  "STOCKS",
  "EDIT_PRICE",
  "KAHON",
  "BILLS",
  "ATTACHMENTS",
  "SALES_HISTORY",
]);
export type CashierPermissions = z.infer<typeof CashierPermissionsEnum>;

export const SackTypeEnum = z.enum(["FIFTY_KG", "TWENTY_FIVE_KG", "FIVE_KG"]);
export type SackType = z.infer<typeof SackTypeEnum>;

export const PaymentMethodEnum = z.enum(["CASH", "BANK_TRANSFER", "CHECK"]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const TransferTypeEnum = z.enum([
  "OWN_CONSUMPTION",
  "RETURN_TO_WAREHOUSE",
  "KAHON",
  "REPACK",
]);
export type TransferType = z.infer<typeof TransferTypeEnum>;

export const AttachmentTypeEnum = z.enum([
  "EXPENSE_RECEIPT",
  "CHECKS_AND_BANK_TRANSFER",
  "INVENTORIES",
  "SUPPORTING_DOCUMENTS",
]);
export type AttachmentType = z.infer<typeof AttachmentTypeEnum>;

export const BillTypeEnum = z.enum([
  "THOUSAND",
  "FIVE_HUNDRED",
  "HUNDRED",
  "FIFTY",
  "TWENTY",
  "COINS",
]);
export type BillType = z.infer<typeof BillTypeEnum>;

export const OrderStatusEnum = z.enum(["PENDING", "COMPLETED", "CANCELLED"]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Base Schemas
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CashierSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  accessKey: z.string(),
  secureCode: z
    .string()
    .cuid()
    .default(() => "generated-by-server"),
  permissions: z.array(CashierPermissionsEnum),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Cashier = z.infer<typeof CashierSchema>;

export const ShiftSchema = z.object({
  id: z.string().cuid(),
  startTime: z.date().default(() => new Date()),
  endTime: z.date().nullable(),
  cashierId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Shift = z.infer<typeof ShiftSchema>;

export const ShiftEmployeeSchema = z.object({
  id: z.string().cuid(),
  shiftId: z.string(),
  employeeId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type ShiftEmployee = z.infer<typeof ShiftEmployeeSchema>;

export const EmployeeSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Employee = z.infer<typeof EmployeeSchema>;

export const ProductSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  picture: z.string().default("https://placehold.co/800x800?text=Product"),
  cashierId: z.string().nullable().optional(), // Made optional for migration
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Product = z.infer<typeof ProductSchema>;

export const SackPriceSchema = z.object({
  id: z.string().cuid(),
  price: parseDecimalPositive,
  stock: parseDecimalIntMin(0),
  type: SackTypeEnum,
  profit: parseDecimalMin(0).nullable().optional(),
  productId: z.string(),
  specialPriceId: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type SackPrice = z.infer<typeof SackPriceSchema>;

export const SpecialPriceSchema = z.object({
  id: z.string().cuid(),
  price: parseDecimalPositive,
  minimumQty: z.number().int().positive(),
  profit: parseDecimalMin(0).nullable().optional(),
  sackPriceId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type SpecialPrice = z.infer<typeof SpecialPriceSchema>;

export const PerKiloPriceSchema = z.object({
  id: z.string().cuid(),
  price: parseDecimalPositive,
  stock: parseDecimalMin(0), // Changed from int to allow decimal values
  profit: parseDecimalMin(0).nullable().optional(),
  productId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type PerKiloPrice = z.infer<typeof PerKiloPriceSchema>;

export const SaleSchema = z.object({
  id: z.string().cuid(),
  cashierId: z.string(),
  totalAmount: parseDecimalPositive,
  paymentMethod: PaymentMethodEnum,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Sale = z.infer<typeof SaleSchema>;

export const SaleItemSchema = z.object({
  id: z.string().cuid(),
  quantity: parseDecimalPositive, // Changed to allow decimal quantities
  discountedPrice: parseDecimalPositive.nullable().optional(),
  isDiscounted: z.boolean().default(false),
  productId: z.string(),
  sackPriceId: z.string().nullable().optional(),
  sackType: SackTypeEnum.nullable().optional(),
  perKiloPriceId: z.string().nullable().optional(),
  saleId: z.string(),
  isGantang: z.boolean().default(false),
  isSpecialPrice: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type SaleItem = z.infer<typeof SaleItemSchema>;

export const DeliverySchema = z.object({
  id: z.string().cuid(),
  driverName: z.string(),
  deliveryTimeStart: z.date(),
  cashierId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Delivery = z.infer<typeof DeliverySchema>;

export const DeliveryItemSchema = z.object({
  id: z.string().cuid(),
  quantity: parseDecimalPositive, // Changed to allow decimal quantities
  productId: z.string(),
  sackPriceId: z.string().nullable().optional(),
  sackType: SackTypeEnum.nullable().optional(),
  perKiloPriceId: z.string().nullable().optional(),
  deliveryId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type DeliveryItem = z.infer<typeof DeliveryItemSchema>;

export const TransferSchema = z.object({
  id: z.string().cuid(),
  quantity: parseDecimalPositive,
  name: z.string(),
  type: TransferTypeEnum,
  cashierId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Transfer = z.infer<typeof TransferSchema>;

export const KahonSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  cashierId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Kahon = z.infer<typeof KahonSchema>;

export const InventorySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  cashierId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Inventory = z.infer<typeof InventorySchema>;

export const KahonItemSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  quantity: parseDecimalPositive,
  kahonId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type KahonItem = z.infer<typeof KahonItemSchema>;

export const InventorySheetSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  inventoryId: z.string(),
  columns: z.number().int().positive().default(10), // Updated to match Prisma default
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type InventorySheet = z.infer<typeof InventorySheetSchema>;

export const InventoryRowSchema = z.object({
  id: z.string().cuid(),
  rowIndex: z.number().int(),
  inventorySheetId: z.string(),
  isItemRow: z.boolean().default(true),
  itemId: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type InventoryRow = z.infer<typeof InventoryRowSchema>;

export const InventoryCellSchema = z.object({
  id: z.string().cuid(),
  columnIndex: z.number().int(),
  inventoryRowId: z.string(),
  color: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  isCalculated: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type InventoryCell = z.infer<typeof InventoryCellSchema>;

export const SheetSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  kahonId: z.string(),
  columns: z.number().int().positive().default(10), // Updated to match Prisma default
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Sheet = z.infer<typeof SheetSchema>;

export const RowSchema = z.object({
  id: z.string().cuid(),
  rowIndex: z.number().int(),
  sheetId: z.string(),
  isItemRow: z.boolean().default(true),
  itemId: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Row = z.infer<typeof RowSchema>;

export const CellSchema = z.object({
  id: z.string().cuid(),
  columnIndex: z.number().int(),
  rowId: z.string(),
  color: z.string().nullable().optional(),
  kahonItemId: z.string().nullable().optional(),
  value: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  isCalculated: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Cell = z.infer<typeof CellSchema>;

export const AttachmentSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  url: z.string(),
  userId: z.string(),
  type: AttachmentTypeEnum,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const BillCountSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().nullable().optional(),
  cashierId: z.string().nullable().optional(),
  beginningBalance: parseDecimalMin(0),
  showBeginningBalance: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type BillCount = z.infer<typeof BillCountSchema>;

export const BillsSchema = z.object({
  id: z.string().cuid(),
  amount: z.number().int().positive(),
  type: BillTypeEnum,
  billCountId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Bills = z.infer<typeof BillsSchema>;

export const CustomerSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  address: z.string(),
  phone: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const OrderSchema = z.object({
  id: z.string().cuid(),
  totalPrice: parseDecimalPositive,
  userId: z.string(),
  customerId: z.string(),
  status: OrderStatusEnum.default("PENDING"),
  saleId: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type Order = z.infer<typeof OrderSchema>;

export const OrderItemSchema = z.object({
  id: z.string().cuid(),
  quantity: parseDecimalPositive, // Changed to allow decimal quantities
  productId: z.string(),
  sackPriceId: z.string().nullable().optional(),
  sackType: SackTypeEnum.nullable().optional(),
  perKiloPriceId: z.string().nullable().optional(),
  isSpecialPrice: z.boolean().default(false),
  orderId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

// New schemas for ExpenseList and ExpenseItems
export const ExpenseListSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().nullable().optional(),
  cashierId: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type ExpenseList = z.infer<typeof ExpenseListSchema>;

export const ExpenseItemsSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  amount: parseDecimalPositive,
  expenseListId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
});
export type ExpenseItems = z.infer<typeof ExpenseItemsSchema>;
