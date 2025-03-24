import { z } from "zod";
import { CashierSchema } from "./schema.type";

export const GetCashierByIdPayloadSchema = CashierSchema;

export type GetCashierByIdPayload = z.infer<typeof GetCashierByIdPayloadSchema>;