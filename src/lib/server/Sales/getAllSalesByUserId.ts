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

  // Apply timezone correction to match profits data (subtract 8 hours for Philippine timezone)
  const correctedSalesData = salesData.map((sale) => ({
    ...sale,
    createdAt: new Date(sale.createdAt.getTime() - 8 * 60 * 60 * 1000),
  }));

  console.log("🔄 SALES: Loaded sales data with Philippine timezone correction");
  console.log(
    "🔄 SALES: Sample sales dates (corrected):",
    correctedSalesData.slice(0, 3).map((sale) => ({
      id: sale.id,
      createdAt: sale.createdAt.toISOString(),
    }))
  );

  return correctedSalesData;
};
