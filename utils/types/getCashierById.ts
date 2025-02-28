import { z } from "zod";
import { CashierPermissionSchema, CashierSchema } from "./schema.type";

export const GetCashierByIdPayloadSchema = CashierSchema.extend({
  permissions: z.array(CashierPermissionSchema),
});

export type GetCashierByIdPayload = z.infer<typeof GetCashierByIdPayloadSchema>;
