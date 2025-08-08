"use server";

import { cookies } from "next/headers";
import { GetAllSalesByUserIdPayload } from "../../../../utils/types/Sales/getAllSalesByUserId.type";
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

  const salesData = (await response.json()) as GetAllSalesByUserIdPayload;
  
  // Apply timezone correction to match profit data (UTC to PH time)
  const correctedSalesData = salesData.map(sale => ({
    ...sale,
    createdAt: new Date(new Date(sale.createdAt).getTime() - 8 * 60 * 60 * 1000),
    originalCreatedAt: sale.createdAt,
  }));

  console.log("🔄 SALES: Applied timezone correction to sales data");
  console.log("🔄 SALES: Sample before/after:", salesData.slice(0, 2).map(sale => ({
    id: sale.id,
    original: sale.createdAt,
    corrected: new Date(new Date(sale.createdAt).getTime() - 8 * 60 * 60 * 1000).toISOString()
  })));

  return correctedSalesData;
};
