import { z } from "zod";

export const RegisterPayloadSchema = z.object({
  access_token: z.string().jwt(),
  name: z.string(),
});
export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;

export const RegisterFormDataSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(4, "Name must be 4 or more characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof RegisterFormDataSchema>;
