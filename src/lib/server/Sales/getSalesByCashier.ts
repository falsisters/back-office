"use server";

import { cookies } from "next/headers";
import {
  GetAllSalesByUserIdPayload,
  GetAllSalesByUserIdPayloadSchema,
} from "../../../../utils/types/Sales/getAllSalesByUserId.type";
import { NestApiError } from "../../../../utils/types/error.type";

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

  console.log(
    "🔄 SALES: Loaded cashier sales data with backend date conversion"
  );
  console.log(
    "🔄 SALES: Sample sales dates:",
    salesData.slice(0, 2).map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt.toISOString(),
    }))
  );

  return salesData;
};
