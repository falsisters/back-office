import { z } from "zod";

// User login schema
export const LoginFormDataSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be 8 or more characters"),
});
export type LoginFormData = z.infer<typeof LoginFormDataSchema>;

export const LoginPayloadSchema = z.object({
  access_token: z.string(),
  name: z.string(),
  permissions: z.array(z.string()).optional(),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export type NestApiError = {
  message: string | string[];
  error?: string;
  statusCode?: number;
};