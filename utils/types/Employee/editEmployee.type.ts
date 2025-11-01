import { z } from "zod";
import { EmployeeResponseSchema } from "./addEmployee.type";

export const EditEmployeeSchema = z.object({
  name: z.string().optional(),
  branch: z.string().optional(),
});

export type EditEmployeeType = z.infer<typeof EditEmployeeSchema>;

export type EditEmployeeResponse = z.infer<typeof EmployeeResponseSchema>;
