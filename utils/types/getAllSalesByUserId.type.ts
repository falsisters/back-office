import { z } from "zod";
import { ProductSchema, SaleItemSchema, SaleSchema } from "./schema.type";

export const GetAllSalesByUserIdPayloadSchema = z.array(
  SaleSchema.extend({
    items: z.array(
      SaleItemSchema.extend({
        product: ProductSchema,
      })
    ),
  })
);

export type GetAllSalesByUserIdPayload = z.infer<
  typeof GetAllSalesByUserIdPayloadSchema
>;
