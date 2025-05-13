import { z } from "zod";
import {
  CashierSchema,
  DeliveryItemSchema,
  DeliverySchema,
  ProductSchema,
  SackPriceSchema,
  PerKiloPriceSchema,
} from "./schema.type";

export const GetAllDeliveriesByUserIdPayloadSchema = z.array(
  DeliverySchema.extend({
    cashier: CashierSchema,
    DeliveryItem: z.array(
      DeliveryItemSchema.extend({
        product: ProductSchema,
        sackPrice: SackPriceSchema.optional().nullable(),
        perKiloPrice: PerKiloPriceSchema.optional().nullable(),
      })
    ),
  })
);

export type GetAllDeliveriesByUserIdPayload = z.infer<
  typeof GetAllDeliveriesByUserIdPayloadSchema
>;