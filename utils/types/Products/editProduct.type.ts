// types/editProduct.type.ts
import { z } from "zod";
import {
  ProductSchema,
  SackPriceSchema,
  PerKiloPriceSchema,
  SpecialPriceSchema,
} from "../schema.type";

export const EditProductFormDataSchema = ProductSchema.extend({
  picture: z.instanceof(File).optional(),
  sackPrices: z
    .array(
      SackPriceSchema.extend({
        id: z.string(),
        profit: z.number().min(0).optional(),
        specialPrice: SpecialPriceSchema.pick({
          id: true,
          price: true,
          minimumQty: true,
          profit: true,
        }).partial(),
      }).partial()
    )
    .optional(),
  perKiloPrice: PerKiloPriceSchema.extend({
    id: z.string(),
    profit: z.number().min(0).optional(),
  })
    .partial()
    .optional(),
}).partial();

export type EditProductFormData = z.infer<typeof EditProductFormDataSchema>;
