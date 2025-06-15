"use server";

import { cookies } from "next/headers";
import type { GetBillCountForDatePayload } from "../../../utils/types/getBillCountByDate.type";
import type { NestApiError } from "../../../utils/types/error.type";

export const getCashierBillCountForDate = async (
  cashierId: string,
  date?: string
): Promise<GetBillCountForDatePayload> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const queryString = date ? `?date=${date}` : "";
  const response = await fetch(
    `${process.env.API_URL}/bills/cashier/${cashierId}${queryString}`,
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
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to fetch bill count"
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
