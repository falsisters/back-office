// types/createProduct.type.ts
import { z } from "zod";
import {
  SackPriceSchema,
  PerKiloPriceSchema,
  SpecialPriceSchema,
  SackTypeEnum,
} from "../schema.type";

// Enhanced file validation for products
const ProductImageSchema = z
  .instanceof(File)
  .refine(
    (file) => {
      const supportedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/tif",
        "image/avif",
        "image/heic",
        "image/heif",
        "image/bmp",
        "image/gif",
      ];
      return supportedTypes.includes(file.type);
    },
    {
      message:
        "Please upload a supported image format (JPEG, PNG, WebP, HEIC, TIFF, AVIF, BMP, GIF)",
    }
  )
  .refine(
    (file) => file.size <= 15 * 1024 * 1024, // 15MB limit
    {
      message: "File size must be less than 15MB",
    }
  );

export const CreateProductFormDataSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    picture: ProductImageSchema,
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
