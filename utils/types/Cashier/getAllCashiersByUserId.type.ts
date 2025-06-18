import { z } from "zod";
import { CashierSchema } from "../schema.type";

export const GetAllCashiersByUserIdPayloadSchema = z.array(CashierSchema);

export type GetAllCashiersByUserIdPayload = z.infer<
  typeof GetAllCashiersByUserIdPayloadSchema
>;
