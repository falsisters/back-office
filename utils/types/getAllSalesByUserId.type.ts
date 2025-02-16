import { z } from "zod";
import {
  CashierSchema,
  ProductSchema,
  SaleItemSchema,
  SaleSchema,
  UserSchema,
} from "./schema.type";

export const GetAllSalesByUserIdPayloadSchema = z.array(
  UserSchema.extend({
    Cashier: z.array(
      CashierSchema.extend({
        Sale: z.array(
          SaleSchema.extend({
            items: z.array(
              SaleItemSchema.extend({
                product: ProductSchema,
              })
            ),
          })
        ),
      })
    ),
  })
);

export type GetAllSalesByUserIdPayload = z.infer<
  typeof GetAllSalesByUserIdPayloadSchema
>;
