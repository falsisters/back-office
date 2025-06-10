"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { DeleteEmployeeResponse } from "../../../utils/types/deleteEmployee.type";

export const deleteEmployee = async (
  id: string
): Promise<DeleteEmployeeResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/employee/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    method: "DELETE",
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occured"
    );
  }

  const payload: DeleteEmployeeResponse = await response.json();
  return payload;
};
