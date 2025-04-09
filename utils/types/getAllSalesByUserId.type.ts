import { z } from "zod";
import { 
  CashierSchema,
  ProductSchema,
  SackTypeEnum,
  SaleItemSchema,
  SaleSchema 
} from "./schema.type";

export const GetAllSalesByUserIdPayloadSchema = z.array(
  SaleSchema.extend({
    cashier: CashierSchema,
    SaleItem: z.array(
      SaleItemSchema.extend({
        product: ProductSchema.extend({
          SackPrice: z.array(z.object({
            type: SackTypeEnum,
            price: z.number(),
            specialPrice: z.object({ price: z.number() }).optional()
          })),
          perKiloPrice: z.object({ price: z.number() }).optional()
        })
      })
    )
  })
);

export type GetAllSalesByUserIdPayload = z.infer<typeof GetAllSalesByUserIdPayloadSchema>;