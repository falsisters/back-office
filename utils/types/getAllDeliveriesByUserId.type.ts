import { z } from "zod";
import {
  CashierSchema,
  DeliveryItemSchema,
  DeliverySchema,
  ProductSchema,
} from "./schema.type";

export const GetAllDeliveriesByUserIdPayloadSchema = z.array(
  DeliverySchema.extend({
    cashier: CashierSchema,
    items: z.array(
      DeliveryItemSchema.extend({
        product: ProductSchema,
      })
    ),
  })
);

export type GetAllDeliveriesByUserIdPayload = z.infer<
  typeof GetAllDeliveriesByUserIdPayloadSchema
>;
