"use server";

import { cookies } from "next/headers";
import {
  GetAllSalesByUserIdPayload,
  GetAllSalesByUserIdPayloadSchema,
} from "../../../../utils/types/Sales/getAllSalesByUserId.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { convertToPhilippineTimeISO, formatPhilippineTimeLog } from "../../utils/timezone";

export const getSalesByCashier = async (
  cashierId: string,
  bypassCache: boolean = false
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const fetchOptions: RequestInit = {
    method: "GET",
  };

  // Build URL with cache-busting parameter if bypassing cache
  let url = `${process.env.API_URL}/sale/cashier/${cashierId}`;

  if (bypassCache) {
    // Add cache-busting timestamp and disable all caching
    url += `?_t=${Date.now()}`;
    fetchOptions.headers = {
      Authorization: `Bearer ${accessToken.value}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    fetchOptions.cache = "no-store";
  } else {
    fetchOptions.headers = { Authorization: `Bearer ${accessToken.value}` };
    fetchOptions.cache = "no-cache";
  }

  const response = await fetch(url, fetchOptions);

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
      createdAt: typeof sale.createdAt === 'string' ? sale.createdAt : sale.createdAt.toISOString(),
      originalCreatedAt: sale.createdAt, // Keep original for debugging
    };
  });

  console.log(
    "🔄 SALES: Raw server data before conversion:",
    salesData.slice(0, 2).map((sale) => ({
      id: sale.id,
      originalCreatedAt: sale.createdAt,
      originalTime: new Date(sale.createdAt).toLocaleString('en-US', { 
        timeZone: 'UTC',
        hour12: true,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      philippineTime: new Date(sale.createdAt).toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        hour12: true,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit', 
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
  );
  
  console.log(
    "🔄 SALES: After +8 hours conversion:",
    correctedSalesData.slice(0, 2).map((sale) => ({
      id: sale.id,
      convertedTime: new Date(sale.createdAt).toLocaleString('en-US', {
        hour12: true,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit'
      })
    }))
  );

  return correctedSalesData;
};
