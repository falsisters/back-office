import { z } from "zod";
import { EmployeeResponseSchema } from "./addEmployee.type";

export type DeleteEmployeeResponse = z.infer<typeof EmployeeResponseSchema>;
