import { z } from "zod"
import { PriceSchema, ProductSchema, ProfitSchema, SpecialPriceSchema } from "./schema.type"

export const EditProductFormDataSchema = z.object({
  product: ProductSchema.pick({ name: true }).extend({
    price: z.array(
      PriceSchema.pick({ price: true, stock: true, type: true }).extend({
        profit: z.array(ProfitSchema.pick({ profit: true })),
        specialPrice: z.array(SpecialPriceSchema.pick({ specialPrice: true, minimumQty: true })),
      }),
    ),
  }),
})

export type EditProductFormData = z.infer<typeof EditProductFormDataSchema>

