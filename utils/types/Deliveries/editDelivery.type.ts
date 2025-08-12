import { z } from "zod";
import { CreateDeliveryDtoSchema } from "./createDelivery.type";

export const EditDeliveryDtoSchema = CreateDeliveryDtoSchema.partial();

export type EditDeliveryDto = z.infer<typeof EditDeliveryDtoSchema>;
