import { z } from "zod";

export const RegisterPayloadSchema = z.object({
  access_token: z.string().jwt(),
  name: z.string(),
});
export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;

export const RegisterFormDataSchema = z.object({
  email: z.string().email(),
  name: z.string().min(4, "Name must be 4 or more characters"),
  password: z.string().min(8, "Password must be 8 or more characters"),
});
export type RegisterFormData = z.infer<typeof RegisterFormDataSchema>;
