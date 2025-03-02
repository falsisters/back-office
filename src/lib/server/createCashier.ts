"use server";

import { cookies } from "next/headers";
import { CreateCashierFormData } from "../../../utils/types/createCashier.type";
import { NestApiError } from "../../../utils/types/error.type";

export const createCashier = async (formData: CreateCashierFormData) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/cashier/create`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    method: "POST",
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
