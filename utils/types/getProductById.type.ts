import { z } from "zod";
import { PriceSchema, ProductSchema, ProfitSchema } from "./schema.type";

export const GetProductByIdPayloadSchema = ProductSchema.extend({
  price: z.array(
    PriceSchema.extend({
      profit: z.array(ProfitSchema),
    })
  ),
});

export type GetProductByIdPayload = z.infer<typeof GetProductByIdPayloadSchema>;
