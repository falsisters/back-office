import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema } from "./schema.type";

export const EditProductFormDataSchema = z.object({
  product: ProductSchema.extend({
    price: z.array(
      PriceSchema.extend({
        profit: z.array(ProfitSchema.partial()),
      }).partial()
    ),
  }).partial(),
});

export type EditProductFormData = z.infer<typeof EditProductFormDataSchema>;
