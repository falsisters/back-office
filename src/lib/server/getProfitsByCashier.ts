"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";

export const getProfitsByCashier = async (cashierId: string, date?: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const queryParams = new URLSearchParams();
  if (date) queryParams.append("date", date);

  const response = await fetch(
    `${
      process.env.API_URL
    }/profit/cashier/${cashierId}?${queryParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken.value}` },
      method: "GET",
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  return await response.json();
};
