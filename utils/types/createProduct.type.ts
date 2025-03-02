import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema, SpecialPriceSchema } from "./schema.type";

export const CreateProductFormDataSchema = z.object({
  product: ProductSchema.extend({
    price: z.array(
      PriceSchema.extend({
        profit: z.array(ProfitSchema.partial()),
        specialPrice: z.array(SpecialPriceSchema.partial())
      }).partial()
    ),
  }).partial(),
});

export type CreateProductFormData = z.infer<typeof CreateProductFormDataSchema>;
