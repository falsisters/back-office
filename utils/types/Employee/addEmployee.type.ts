import { z } from "zod";

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateEmployeeType = z.infer<typeof CreateEmployeeSchema>;

export const EmployeeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EmployeeResponse = z.infer<typeof EmployeeResponseSchema>;
