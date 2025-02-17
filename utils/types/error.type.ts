import { z } from "zod";

export const NestApiErrorSchema = z.object({
  error: z.string(),
  message: z.array(z.string()),
});
export type NestApiError = z.infer<typeof NestApiErrorSchema>;
