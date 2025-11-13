"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { GetAllTransfersResponse } from "../../../../utils/types/Transfers/getAllTransfers.type";
import { convertToPhilippineTimeISO } from "../../utils/timezone";

export const getTransfersByCashierWithDate = async (
  cashierId: string,
  date?: string
): Promise<{
  data?: GetAllTransfersResponse;
  error?: string;
}> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const url = new URL(
      `${process.env.API_URL}/transfer/cashier/${cashierId}/date`
    );
    if (date) {
      url.searchParams.append("date", date);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const data: NestApiError = await response.json();
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Failed to get filtered transfers for cashier"
      );
    }

    const data: GetAllTransfersResponse = await response.json();
    
    // TEMPORARILY: No timezone conversion - server may already be sending Philippine time
    const correctedData = data.map((transfer) => {
      return {
        ...transfer,
        createdAt: typeof transfer.createdAt === 'string' ? transfer.createdAt : transfer.createdAt,
      };
    });
    
    return { data: correctedData };
  } catch (error) {
    console.error("Get transfers by cashier with date error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};
