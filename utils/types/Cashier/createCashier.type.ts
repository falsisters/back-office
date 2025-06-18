// types/createCashier.type.ts
import { z } from "zod";
import { CashierPermissionsEnum } from "../schema.type";

export const CreateCashierSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  accessKey: z.string().length(4, "Access key must be exactly 4 characters"),
  permissions: z
    .array(CashierPermissionsEnum)
    .min(1, "At least one permission is required"),
});

export type CreateCashierType = z.infer<typeof CreateCashierSchema>;
