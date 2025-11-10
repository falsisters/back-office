"use server";

import { cookies } from "next/headers";
import {
  GetVoidedSalesByUserPayload,
  GetVoidedSalesByUserPayloadSchema,
} from "../../../../utils/types/Sales/getVoidedSalesByUser.type";
import { NestApiError } from "../../../../utils/types/error.type";

export const getVoidedSalesByUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sale/voided/user`, {
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
  const voidedSalesData = GetVoidedSalesByUserPayloadSchema.parse(rawSalesData);

  console.log("🔄 VOIDED SALES: Loaded voided sales data from server");
  console.log(
    "🔄 VOIDED SALES: Sample voided sales:",
    voidedSalesData.slice(0, 3).map((sale) => ({
      id: sale.id,
      voidedAt: sale.voidedAt,
      createdAt: sale.createdAt,
    }))
  );

  return voidedSalesData;
};
