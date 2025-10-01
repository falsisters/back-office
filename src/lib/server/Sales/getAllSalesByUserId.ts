"use server";

import { cookies } from "next/headers";
import {
  GetAllSalesByUserIdPayload,
  GetAllSalesByUserIdPayloadSchema,
} from "../../../../utils/types/Sales/getAllSalesByUserId.type";
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

  const rawSalesData = await response.json();

  // Parse and validate the response data with decimal transformations
  const salesData = GetAllSalesByUserIdPayloadSchema.parse(rawSalesData);

  // Apply Manila timezone correction (UTC-8) to match profits implementation
  const correctedSalesData = salesData.map((sale) => {
    const originalDate = new Date(sale.createdAt);
    const correctedDate = new Date(
      originalDate.getTime() - 8 * 60 * 60 * 1000 // Subtract 8 hours for Manila time
    );
    return {
      ...sale,
      createdAt: correctedDate,
      originalCreatedAt: sale.createdAt, // Keep original for debugging
    };
  });


  console.log("🔄 SALES: Loaded sales data with Philippine timezone correction");
  console.log(
    "🔄 SALES: Sample sales dates:",
    salesData.slice(0, 3).map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt.toISOString(),
    }))
  );

  return correctedSalesData;
  return correctedSalesData;
};
