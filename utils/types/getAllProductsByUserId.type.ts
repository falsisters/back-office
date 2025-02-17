import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema } from "./schema.type";

export const GetAllProductsByUserIdPayloadSchema = z.array(
  ProductSchema.extend({
    price: z.array(
      PriceSchema.extend({
        profit: z.array(ProfitSchema),
      })
    ),
  })
);

export type GetAllProductsByUserIdPayload = z.infer<
  typeof GetAllProductsByUserIdPayloadSchema
>;
