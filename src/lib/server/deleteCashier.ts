"use server";

import { cookies } from "next/headers";
import { APIError } from "../../../utils/types/error.type";
import { DeleteCashierFormData } from "../../../utils/types/deleteCashier.type";

export const createCashier = async (formData: DeleteCashierFormData) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/cashier/create`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "DELETE",
    body: JSON.stringify(formData),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: APIError = await response.json();
    throw new Error(data.message);
  }

  return response.json();
};
