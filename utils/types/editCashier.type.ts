import { z } from "zod";

export const EditCashierFormDataSchema = z.object({
  id: z.string(),
  name: z.string().min(4, "Name must be 4 or more characters").optional(),
  accessKey: z
    .string()
    .length(4, "Access key must only be 4 characters")
    .optional(),
});
export type EditCashierFormData = z.infer<typeof EditCashierFormDataSchema>;
