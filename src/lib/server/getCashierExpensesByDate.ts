"use server";

import { GetExpenseByDateType } from "../../../utils/types/getExpenseByDate.type";
import { cookies } from "next/headers";

export const getCashierExpenseByDate = async (
  cashierId: string,
  params: GetExpenseByDateType
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const queryString = params?.date ? `?date=${params.date}` : "";
  const response = await fetch(
    `${process.env.API_URL}/expenses/cashier/${cashierId}/today${queryString}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch expenses");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
