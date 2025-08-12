import { z } from "zod";
import {
  ProductSchema,
  SackPriceSchema,
  SpecialPriceSchema,
  PerKiloPriceSchema,
  CashierSchema,
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
    if (val === null || val === undefined) return undefined;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    if (typeof val === "number") return val;
    return undefined;
  });

export const ProductResponseSchema = ProductSchema.extend({
  SackPrice: z.array(
    SackPriceSchema.extend({
      price: parseDecimal,
      stock: parseDecimal,
      profit: parseOptionalDecimal,
      specialPrice: SpecialPriceSchema.extend({
        price: parseDecimal,
        profit: parseOptionalDecimal,
      }).nullable(),
    })
  ),
  perKiloPrice: PerKiloPriceSchema.extend({
    price: parseDecimal,
    stock: parseDecimal,
    profit: parseOptionalDecimal,
  }).nullable(),
  cashier: CashierSchema.pick({
    id: true,
    name: true,
    userId: true,
  })
    .nullable()
    .optional(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type GetAllProductsResponse = ProductResponse[];
