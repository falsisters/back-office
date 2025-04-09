import { z } from "zod";
import { 
  ProductSchema, 
  SackPriceSchema, 
  SpecialPriceSchema,
  PerKiloPriceSchema 
} from "./schema.type";

export const ProductResponseSchema = ProductSchema.extend({
  SackPrice: z.array(
    SackPriceSchema.extend({
      specialPrice: SpecialPriceSchema.extend({
        profit: z.number().positive()
      }).nullable()
    })
  ),
  perKiloPrice: PerKiloPriceSchema.extend({
    profit: z.number().positive()
  }).nullable()
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type GetAllProductsResponse = ProductResponse[];