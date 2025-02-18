import { z } from "zod";
import { CashierPermissionSchema } from "./schema.type";

export const CreateCashierFormDataSchema = z.object({
  name: z.string().min(4, "Name must be 4 or more characters"),
  accessKey: z.string().length(4, "Access key must be 4 characters only"),
  permissions: z.array(CashierPermissionSchema.partial()),
});
export type CreateCashierFormData = z.infer<typeof CreateCashierFormDataSchema>;
