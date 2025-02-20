import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema, SpecialPriceSchema } from "./schema.type";

export const GetAllProductsByUserIdPayloadSchema = z.array(
  ProductSchema.extend({
    price: z.array(
      PriceSchema.extend({
        profit: z.array(ProfitSchema),
        specialPrice: z.array(SpecialPriceSchema)
      })
    ),
  })
);

export type GetAllProductsByUserIdPayload = z.infer<
  typeof GetAllProductsByUserIdPayloadSchema
>;
