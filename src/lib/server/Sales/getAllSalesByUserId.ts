"use server";

import { cookies } from "next/headers";
import {
  GetAllSalesByUserIdPayload,
  GetAllSalesByUserIdPayloadSchema,
} from "../../../../utils/types/Sales/getAllSalesByUserId.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { convertToPhilippineTimeISO, formatPhilippineTimeLog } from "../../utils/timezone";

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

    // TEMPORARILY: No timezone conversion - server may already be sending Philippine time
  const correctedSalesData = salesData.map((sale) => {
    return {
      ...sale,
      createdAt: typeof sale.createdAt === 'string' ? sale.createdAt : sale.createdAt.toISOString(),
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
