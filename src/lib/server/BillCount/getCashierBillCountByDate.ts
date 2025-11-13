"use server";

import { cookies } from "next/headers";
import type { GetBillCountForDatePayload } from "../../../../utils/types/BillCount/getBillCountByDate.type";
import type { NestApiError } from "../../../../utils/types/error.type";
import { convertToPhilippineTime } from "../../utils/timezone";

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

  console.log("🔍 BILL COUNT DEBUG - Raw data from backend:", {
    summaryStep1: data?.summaryStep1,
    summaryFinal: data?.summaryFinal,
    beginningBalance: data?.beginningBalance,
    showBeginningBalance: data?.showBeginningBalance,
    billsTotal: data?.billsTotal,
    totalExpenses: data?.totalExpenses,
    calculateCheck: data?.summaryFinal + data?.beginningBalance
  });

  // TEMPORARILY: No timezone conversion - testing if server already sends Philippine time
  if (data) {
    return {
      ...data,
      bills: data.bills.map((bill: any) => ({
        ...bill,
      })),
    };
  }

  return null;
};
