import { z } from "zod";
import {
  CashierSchema,
  DeliveryItemSchema,
  DeliverySchema,
  ProductSchema,
} from "../schema.type";

export const GetDeliveryByIdPayloadSchema = DeliverySchema.extend({
  cashier: CashierSchema,
  DeliveryItem: z.array(
    DeliveryItemSchema.extend({
      product: ProductSchema,
    })
  ),
});

export type GetDeliveryByIdPayload = z.infer<
  typeof GetDeliveryByIdPayloadSchema
>;
