import { z } from "zod";
import { 
  ProductSchema, 
  SackPriceSchema, 
  SpecialPriceSchema,
  PerKiloPriceSchema 
} from "./schema.type";

// Product response schema with related data
export const ProductResponseSchema = ProductSchema.extend({
  SackPrice: z.array(
    SackPriceSchema.extend({
      specialPrice: SpecialPriceSchema
    })
  ),
  perKiloPrice: z.array(PerKiloPriceSchema)
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type GetAllProductsResponse = ProductResponse[];