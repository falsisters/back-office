"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { EditCashierFormData } from "../../../utils/types/editCashier.type";

export const editCashier = async (
  id: string,
  formData: EditCashierFormData
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/cashier/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    method: "PUT",
    body: JSON.stringify(formData),
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

  return response.json();
};
