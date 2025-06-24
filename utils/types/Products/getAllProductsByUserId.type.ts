import { z } from "zod";
import {
  ProductSchema,
  SackPriceSchema,
  SpecialPriceSchema,
  PerKiloPriceSchema,
  CashierSchema,
} from "../schema.type";

export const ProductResponseSchema = ProductSchema.extend({
  SackPrice: z.array(
    SackPriceSchema.extend({
      profit: z.number().min(0).optional(),
      specialPrice: SpecialPriceSchema.extend({
        profit: z.number().min(0).optional(),
      }).nullable(),
    })
  ),
  perKiloPrice: PerKiloPriceSchema.extend({
    profit: z.number().min(0).optional(),
  }).nullable(),
  cashier: CashierSchema.pick({
    id: true,
    name: true,
    userId: true,
  })
    .nullable()
    .optional(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type GetAllProductsResponse = ProductResponse[];
