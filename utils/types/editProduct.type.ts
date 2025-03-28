// types/editProduct.type.ts
import { z } from "zod";
import { ProductSchema, SackPriceSchema, PerKiloPriceSchema, SpecialPriceSchema } from "./schema.type";

export const EditProductFormDataSchema = ProductSchema.extend({
  picture: z.instanceof(File).optional(),
  sackPrices: z.array(
    SackPriceSchema.extend({
      specialPrice: SpecialPriceSchema.partial()
    }).partial()
  ),
  perKiloPrice: PerKiloPriceSchema.partial()
}).partial();

export type EditProductFormData = z.infer<typeof EditProductFormDataSchema>;