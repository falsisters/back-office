"use server";

import { cookies } from "next/headers";
import type { GetBillCountForDatePayload } from "../../../../utils/types/BillCount/getBillCountByDate.type";
import type { NestApiError } from "../../../../utils/types/error.type";

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
  if (!text) return null;

  const data = JSON.parse(text);

  // Convert date strings to Date objects to match type expectations
  if (data) {
    return {
      ...data,
      date: new Date(data.date),
      updatedAt: new Date(data.updatedAt),
      bills: data.bills.map((bill: any) => ({
        ...bill,
        createdAt: new Date(bill.createdAt),
        updatedAt: new Date(bill.updatedAt),
      })),
    };
  }

  return null;
};
