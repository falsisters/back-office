// types/editCashier.type.ts
import { z } from "zod";
import { CashierPermissionsEnum } from "../schema.type";

export const EditCashierSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters").optional(),
  accessKey: z
    .string()
    .length(4, "Access key must be exactly 4 characters")
    .optional(),
  permissions: z
    .array(CashierPermissionsEnum)
    .min(1, "At least one permission is required")
    .optional(),
});

export type EditCashierType = z.infer<typeof EditCashierSchema>;
