// types/editProduct.type.ts
import { z } from "zod";
import { Decimal } from "decimal.js";
import {
  ProductSchema,
  SackPriceSchema,
  PerKiloPriceSchema,
  SpecialPriceSchema,
} from "../schema.type";

// Helper function for decimal validation in forms
const decimalInput = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const decimal = new Decimal(val);
    return decimal.toNumber();
  })
  .refine((val) => val > 0, { message: "Value must be positive" });

const decimalStock = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const decimal = new Decimal(val);
    return decimal.toNumber();
  })
  .refine((val) => val >= 0, { message: "Stock cannot be negative" });

const optionalDecimalInput = z
  .union([z.number(), z.string(), z.undefined()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return undefined;
    const decimal = new Decimal(val);
    return decimal.toNumber();
  });

export const EditProductFormDataSchema = ProductSchema.extend({
  picture: z.instanceof(File).optional(),
  sackPrices: z
    .array(
      z
        .object({
          id: z.string(),
          price: decimalInput,
          stock: decimalStock,
          type: z.string(),
          profit: optionalDecimalInput,
          specialPrice: z
            .object({
              id: z.string().optional(),
              price: decimalInput,
              minimumQty: z.number().int().positive(),
              profit: optionalDecimalInput,
            })
            .partial()
            .optional(),
        })
        .partial()
    )
    .optional(),
  perKiloPrice: z
    .object({
      id: z.string(),
      price: decimalInput,
      stock: decimalStock,
      profit: optionalDecimalInput,
    })
    .partial()
    .optional(),
})
  .partial()
  .refine(
    (data) => {
      // Skip validation if this is a partial update without pricing data
      if (!data.sackPrices && !data.perKiloPrice) return true;

      const hasSackPrices = data.sackPrices && data.sackPrices.length > 0;
      const hasPerKiloPrice =
        data.perKiloPrice &&
        data.perKiloPrice.price &&
        data.perKiloPrice.price > 0;
      return hasSackPrices || hasPerKiloPrice;
    },
    {
      message:
        "At least one pricing option (sack prices or per kilo price) is required",
      path: ["sackPrices"],
    }
  );

export type EditProductFormData = z.infer<typeof EditProductFormDataSchema>;
