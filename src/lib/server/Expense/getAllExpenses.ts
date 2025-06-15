"use server";

import { GetAllExpensesPayload } from "../../../../utils/types/Expense/getAllExpenses.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const getAllExpenses = async (): Promise<GetAllExpensesPayload> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/expenses/user/list`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to fetch expenses"
    );
  }

  return await response.json();
};
