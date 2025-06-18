// types/editProduct.type.ts
import { z } from "zod";
import {
  ProductSchema,
  SackPriceSchema,
  PerKiloPriceSchema,
  SpecialPriceSchema,
} from "../schema.type";

export const EditProductFormDataSchema = ProductSchema.extend({
  picture: z.instanceof(File).optional(),
  sackPrices: z
    .array(
      SackPriceSchema.extend({
        id: z.string(),
        profit: z.number().min(0).optional(),
        specialPrice: SpecialPriceSchema.pick({
          id: true,
          price: true,
          minimumQty: true,
          profit: true,
        }).partial(),
      }).partial()
    )
    .optional(),
  perKiloPrice: PerKiloPriceSchema.extend({
    id: z.string(),
    profit: z.number().min(0).optional(),
  })
    .partial()
    .optional(),
})
  .partial()
  .refine(
    (data) => {
      // Skip validation if this is a partial update without pricing data
      if (!data.sackPrices && !data.perKiloPrice) return true;

      const hasSackPrices = data.sackPrices && data.sackPrices.length > 0;
      const hasPerKiloPrice =
        data.perKiloPrice &&
        data.perKiloPrice.price &&
        data.perKiloPrice.price > 0;
      return hasSackPrices || hasPerKiloPrice;
    },
    {
      message:
        "At least one pricing option (sack prices or per kilo price) is required",
      path: ["sackPrices"],
    }
  );

export type EditProductFormData = z.infer<typeof EditProductFormDataSchema>;
