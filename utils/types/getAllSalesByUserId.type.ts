import { z } from "zod";
import {
  CashierSchema,
  ProductSchema,
  SaleItemSchema,
  SaleSchema,
} from "./schema.type";

export const GetAllSalesByUserIdPayloadSchema = z.array(
  SaleSchema.extend({
    cashier: CashierSchema,
    items: z.array(
      SaleItemSchema.extend({
        ProductSchema,
      })
    ),
  })
);

export type GetAllSalesByUserIdPayload = z.infer<
  typeof GetAllSalesByUserIdPayloadSchema
>;
