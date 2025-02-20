import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema, SpecialPriceSchema } from "./schema.type";

export const GetProductByIdPayloadSchema = ProductSchema.extend({
  price: z.array(
    PriceSchema.extend({
      profit: z.array(ProfitSchema),
      specialPrice: z.array(SpecialPriceSchema)
    })
  ),
});

export type GetProductByIdPayload = z.infer<typeof GetProductByIdPayloadSchema>;
