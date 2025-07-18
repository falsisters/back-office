import { z } from "zod";
import {
  CashierSchema,
  DeliveryItemSchema,
  DeliverySchema,
  ProductSchema,
  SackPriceSchema,
  PerKiloPriceSchema,
} from "../schema.type";

export const GetAllDeliveriesByCashierIdPayloadSchema = z.array(
  DeliverySchema.extend({
    cashier: CashierSchema,
    DeliveryItem: z.array(
      DeliveryItemSchema.extend({
        product: ProductSchema,
        SackPrice: SackPriceSchema.optional().nullable(),
        perKiloPrice: PerKiloPriceSchema.optional().nullable(),
      })
    ),
  })
);

export type GetAllDeliveriesByCashierIdPayload = z.infer<
  typeof GetAllDeliveriesByCashierIdPayloadSchema
>;
