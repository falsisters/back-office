"use server";

import { revalidatePath } from "next/cache";
import { CreateCashierType } from "../../../utils/types/createCashier.type";
import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";

export const createCashier = async (formData: CreateCashierType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/cashier/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to create cashier");
  }

  revalidatePath("/cashiers")
  return await response.json();
};