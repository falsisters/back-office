"use server";

import { revalidatePath } from "next/cache";
import { EditCashierType } from "../../../../utils/types/Cashier/editCashier.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const editCashier = async (id: string, formData: EditCashierType) => {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/cashier/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to update cashier");
  }
  revalidatePath("/cashiers");
  return response.json();
};
