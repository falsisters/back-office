"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  EditEmployeeType,
  EditEmployeeResponse,
} from "../../../../utils/types/Employee/editEmployee.type";

export const editEmployee = async (
  id: string,
  formData: EditEmployeeType
): Promise<EditEmployeeResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/employee/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to update employee");
  }

  revalidatePath("/employees");
  const payload: EditEmployeeResponse = await response.json();
  return payload;
};
