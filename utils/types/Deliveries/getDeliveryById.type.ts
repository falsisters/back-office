import { z } from "zod";
import {
  CashierSchema,
  DeliveryItemSchema,
  DeliverySchema,
  ProductSchema,
  SackPriceSchema,
  PerKiloPriceSchema,
} from "../schema.type";

export const GetDeliveryByIdPayloadSchema = DeliverySchema.extend({
  cashier: CashierSchema,
  DeliveryItem: z.array(
    DeliveryItemSchema.extend({
      product: ProductSchema,
      SackPrice: SackPriceSchema.optional().nullable(),
      perKiloPrice: PerKiloPriceSchema.optional().nullable(),
    })
  ),
});

export type GetDeliveryByIdPayload = z.infer<
  typeof GetDeliveryByIdPayloadSchema
>;
