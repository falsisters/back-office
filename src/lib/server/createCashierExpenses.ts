"use server";

import { CreateExpenseType } from "../../../utils/types/createExpense.type";
import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const createCashierExpense = async (
  cashierId: string,
  data: CreateExpenseType
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/expenses/cashier/${cashierId}/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to create expense"
    );
  }

  revalidatePath("/expenses");
  return await response.json();
};
