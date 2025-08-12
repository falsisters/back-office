// types/createProduct.type.ts
import { z } from "zod";
import { Decimal } from "decimal.js";
import {
  SackPriceSchema,
  PerKiloPriceSchema,
  SpecialPriceSchema,
  SackTypeEnum,
} from "../schema.type";

// Helper function for decimal validation in forms
const decimalInput = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const decimal = new Decimal(val);
    return decimal.toNumber();
  })
  .refine((val) => val > 0, { message: "Value must be positive" });

const decimalStock = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const decimal = new Decimal(val);
    return decimal.toNumber();
  })
  .refine((val) => val >= 0, { message: "Stock cannot be negative" });

const optionalDecimalInput = z
  .union([z.number(), z.string(), z.undefined()])
  .optional()
  .transform((val) => {
    if (val === undefined || val === null) return undefined;
    const decimal = new Decimal(val);
    return decimal.toNumber();
  });

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
        z.object({
          price: decimalInput,
          stock: decimalStock,
          type: SackTypeEnum,
          profit: optionalDecimalInput,
          specialPrice: z
            .object({
              price: decimalInput,
              minimumQty: z.number().int().positive(),
              profit: optionalDecimalInput,
            })
            .partial()
            .optional(),
        })
      )
      .optional()
      .default([]),
    perKiloPrice: z
      .object({
        price: decimalInput,
        stock: decimalStock,
        profit: optionalDecimalInput,
      })
      .partial()
      .optional(),
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
