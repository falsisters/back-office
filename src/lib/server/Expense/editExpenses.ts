"use server";

import { EditExpenseType } from "../../../../utils/types/Expense/editExpense.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const editExpense = async ({
  expenseListId,
  ...data
}: EditExpenseType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  try {
    const response = await fetch(
      `${process.env.API_URL}/expenses/user/update/${expenseListId}`,
      {
        method: "PUT",
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
  } catch (error) {
    throw error;
  }
};
