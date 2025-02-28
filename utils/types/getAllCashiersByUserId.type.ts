import { z } from "zod";
import { CashierPermissionSchema, CashierSchema } from "./schema.type";

export const GetAllCashiersByUserIdPayloadSchema = z.array(
  CashierSchema.extend({
    permissions: z.array(CashierPermissionSchema),
  })
);

export type GetAllCashiersByUserIdPayload = z.infer<
  typeof GetAllCashiersByUserIdPayloadSchema
>;
