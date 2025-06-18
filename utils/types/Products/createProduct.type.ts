// types/createProduct.type.ts
import { z } from "zod";
import {
  SackPriceSchema,
  PerKiloPriceSchema,
  SpecialPriceSchema,
  SackTypeEnum,
} from "../schema.type";

export const CreateProductFormDataSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    picture: z.instanceof(File, { message: "Product image is required" }),
    sackPrices: z
      .array(
        SackPriceSchema.extend({
          type: SackTypeEnum,
          profit: z.number().min(0).optional(),
          specialPrice: SpecialPriceSchema.pick({
            price: true,
            minimumQty: true,
            profit: true,
          }).partial(),
        }).pick({ price: true, stock: true, type: true, profit: true })
      )
      .optional()
      .default([]),
    perKiloPrice: PerKiloPriceSchema.pick({
      price: true,
      stock: true,
      profit: true,
    }).partial(),
  })
  .refine(
    (data) => {
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

export type CreateProductFormData = z.infer<typeof CreateProductFormDataSchema>;
