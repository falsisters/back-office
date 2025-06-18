"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  CreateEmployeeType,
  EmployeeResponse,
} from "../../../../utils/types/Employee/addEmployee.type";

export const createEmployee = async (
  formData: CreateEmployeeType
): Promise<EmployeeResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/employee/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to create employee");
  }

  revalidatePath("/employees");
  const payload: EmployeeResponse = await response.json();
  return payload;
};
