import { z } from "zod";

export const DeleteCashierFormDataSchema = z.object({
  id: z.string(),
});
export type DeleteCashierFormData = z.infer<typeof DeleteCashierFormDataSchema>;
