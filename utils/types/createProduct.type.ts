// types/createProduct.type.ts
import { z } from "zod";
import { SackPriceSchema, PerKiloPriceSchema, SpecialPriceSchema, SackTypeEnum } from "./schema.type";

export const CreateProductFormDataSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  picture: z.instanceof(File, { message: "Product image is required" }),
  sackPrices: z.array(
    SackPriceSchema.extend({
      type: SackTypeEnum,
      specialPrice: SpecialPriceSchema.pick({ price: true, minimumQty: true })
    }).pick({ price: true, stock: true, type: true })
  ).min(1, "At least one sack price is required"),
  perKiloPrice: PerKiloPriceSchema.pick({ price: true, stock: true })
});

export type CreateProductFormData = z.infer<typeof CreateProductFormDataSchema>;