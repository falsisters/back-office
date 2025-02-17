import { z } from "zod";
import { UserPermissionSchema } from "./schema.type";

export const EditCashierFormDataSchema = z.object({
  name: z.string().min(4, "Name must be 4 or more characters").optional(),
  accessKey: z
    .string()
    .length(4, "Access key must only be 4 characters")
    .optional(),
  permissions: z.array(UserPermissionSchema.partial()),
});
export type EditCashierFormData = z.infer<typeof EditCashierFormDataSchema>;
