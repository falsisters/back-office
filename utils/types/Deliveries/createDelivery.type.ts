import { z } from "zod";
import { SackTypeEnum, parseDecimalPositive } from "../schema.type";

export const PerKiloPriceDtoSchema = z.object({
  id: z.string(),
  quantity: parseDecimalPositive,
});

export const SackPriceDtoSchema = z.object({
  id: z.string(),
  quantity: parseDecimalPositive,
  type: SackTypeEnum,
});

export const ProductDtoSchema = z.object({
  id: z.string(),
  sackPrice: SackPriceDtoSchema.optional(),
  perKiloPrice: PerKiloPriceDtoSchema.optional(),
});

export const CreateDeliveryDtoSchema = z.object({
  driverName: z.string(),
  deliveryTimeStart: z.date(),
  deliveryItem: z.array(ProductDtoSchema),
});

export type CreateDeliveryDto = z.infer<typeof CreateDeliveryDtoSchema>;
