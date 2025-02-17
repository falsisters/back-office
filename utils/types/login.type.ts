import { z } from "zod";

export const LoginFormDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be 8 or more characters"),
});
export type LoginFormData = z.infer<typeof LoginFormDataSchema>;

export const LoginPayloadSchema = z.object({
  access_token: z.string().jwt(),
  name: z.string(),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
