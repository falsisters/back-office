import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema } from "./schema.type";

export const CreateProductFormDataSchema = z.object({
  id: z.string(),
  product: ProductSchema.partial(),
  price: z.array(PriceSchema.partial()),
  profit: z.array(ProfitSchema.partial()),
});

export type CreateProductFormData = z.infer<typeof CreateProductFormDataSchema>;
