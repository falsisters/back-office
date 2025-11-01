import { z } from "zod";
import {
  SackTypeEnum,
  PaymentMethodEnum,
} from "../schema.type";

// Helper function to parse decimal values from API responses (strings or numbers)
const parseDecimal = z
  .union([z.number(), z.string(), z.null()])
  .transform((val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof val === "number") return val;
    return 0;
  });

// Helper for optional decimal values that can be null
const parseOptionalDecimal = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }
    if (typeof val === "number") return val;
    return null;
  });

// Helper to parse string dates from backend
const parseDate = z.union([z.string(), z.date()]).transform((val) => {
  if (val instanceof Date) return val;
  return new Date(val);
});

// Helper to parse nullable dates
const parseNullableDate = z
  .union([z.string(), z.date(), z.null()])
  .transform((val) => {
    if (val === null) return null;
    if (val instanceof Date) return val;
    return new Date(val);
  });

export const GetVoidedSalesByUserPayloadSchema = z.array(
  z.object({
    id: z.string().cuid(),
    cashierId: z.string(),
    totalAmount: parseDecimal,
    paymentMethod: PaymentMethodEnum,
    isVoid: z.boolean(),
    voidedAt: parseNullableDate,
    createdAt: parseDate,
    updatedAt: parseDate,
    cashier: z.object({
      id: z.string().cuid(),
      name: z.string(),
      accessKey: z.string(),
      userId: z.string(),
      createdAt: parseDate,
      updatedAt: parseDate,
    }).optional(),
    SaleItem: z.array(
      z.object({
        id: z.string().cuid(),
        quantity: parseDecimal,
        price: parseOptionalDecimal,
        discountedPrice: parseOptionalDecimal,
        isDiscounted: z.boolean().default(false),
        productId: z.string(),
        sackPriceId: z.string().nullable().optional(),
        sackType: SackTypeEnum.nullable().optional(),
        perKiloPriceId: z.string().nullable().optional(),
        saleId: z.string(),
        isGantang: z.boolean().default(false),
        isSpecialPrice: z.boolean().default(false),
        createdAt: parseDate,
        updatedAt: parseDate,
        product: z.object({
          id: z.string().cuid(),
          name: z.string(),
          picture: z
            .string()
            .default("https://placehold.co/800x800?text=Product"),
          cashierId: z.string().nullable().optional(),
          userId: z.string(),
          createdAt: parseDate,
          updatedAt: parseDate,
          SackPrice: z.array(
            z.object({
              id: z.string().cuid(),
              type: SackTypeEnum,
              price: parseDecimal,
              stock: parseDecimal,
              profit: parseOptionalDecimal,
              specialPrice: z
                .object({
                  id: z.string().cuid(),
                  price: parseDecimal,
                  minimumQty: z.number().int(),
                  profit: parseOptionalDecimal,
                })
                .nullable()
                .optional(),
            })
          ),
          perKiloPrice: z
            .object({
              id: z.string().cuid(),
              price: parseDecimal,
              stock: parseDecimal,
              profit: parseOptionalDecimal,
            })
            .nullable()
            .optional(),
        }),
        perKiloPrice: z
          .object({
            id: z.string().cuid(),
            price: parseDecimal,
            stock: parseDecimal,
            profit: parseOptionalDecimal,
          })
          .nullable()
          .optional(),
        SackPrice: z
          .object({
            id: z.string().cuid(),
            type: SackTypeEnum,
            price: parseDecimal,
            stock: parseDecimal,
            profit: parseOptionalDecimal,
            specialPrice: z
              .object({
                id: z.string().cuid(),
                price: parseDecimal,
                minimumQty: z.number().int(),
                profit: parseOptionalDecimal,
              })
              .nullable()
              .optional(),
          })
          .nullable()
          .optional(),
      })
    ),
  })
);

export type GetVoidedSalesByUserPayload = z.infer<
  typeof GetVoidedSalesByUserPayloadSchema
>;
