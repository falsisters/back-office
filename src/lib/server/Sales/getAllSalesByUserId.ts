"use server";

import { cookies } from "next/headers";
import { GetAllSalesByUserIdPayload } from "../../../../utils/types/Sales/getAllSalesByUserId.type";
import { NestApiError } from "../../../../utils/types/error.type";

export const getAllSalesByUserId = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sale/user`, {
    headers: { Authorization: `Bearer ${accessToken.value}` },
    method: "GET",
    next: { revalidate: 60 },
  });

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
