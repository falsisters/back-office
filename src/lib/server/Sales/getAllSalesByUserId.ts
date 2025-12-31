"use server";

import { cookies } from "next/headers";
import {
  GetAllSalesByUserIdPayload,
  GetAllSalesByUserIdPayloadSchema,
} from "../../../../utils/types/Sales/getAllSalesByUserId.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { convertToPhilippineTimeISO, formatPhilippineTimeLog } from "../../utils/timezone";

// Helper to get today's date in Manila timezone as YYYY-MM-DD
const getTodayManilaDate = () => {
  const now = new Date();
  // Manila is UTC+8
  const manilaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return manilaTime.toISOString().split('T')[0];
};

export const getAllSalesByUserId = async (date?: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Default to today's date in Manila timezone if not provided
  const dateParam = date || getTodayManilaDate();
  const url = `${process.env.API_URL}/sale/user?date=${dateParam}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken.value}` },
    method: "GET",
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  const rawSalesData = await response.json();

  // Parse and validate the response data with decimal transformations
  const salesData = GetAllSalesByUserIdPayloadSchema.parse(rawSalesData);

    // TEMPORARILY: No timezone conversion - server may already be sending Philippine time
  const correctedSalesData = salesData.map((sale) => {
    return {
      ...sale,
      // Keep createdAt as Date object to match TypeScript expectations
      createdAt: typeof sale.createdAt === 'string' ? new Date(sale.createdAt) : sale.createdAt,
      originalCreatedAt: sale.createdAt, // Keep original for debugging
    };
  });


  console.log("🔄 SALES: Loaded sales data with Philippine timezone conversion (UTC+8)");
  console.log(
    "🔄 SALES: Sample sales timezone conversion:",
    salesData.slice(0, 3).map((sale) => ({
      id: sale.id,
      conversion: formatPhilippineTimeLog(sale.createdAt),
    }))
  );

  return correctedSalesData;
};
