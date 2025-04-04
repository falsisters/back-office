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
      specialPrice: SpecialPriceSchema.nullable()
    })
  ),
  perKiloPrice: PerKiloPriceSchema.nullable()
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type GetAllProductsResponse = ProductResponse[];