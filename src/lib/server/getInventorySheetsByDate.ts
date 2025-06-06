// src/lib/server/getInventorySheetsByDate.ts
"use server";

import { cookies } from "next/headers";
import type { GetInventorySheetsByDateParams } from "../../../utils/types/inventory.type";
import { GetInventorySheetPayload } from "../../../utils/types/inventory.type";
import type { NestApiError } from "../../../utils/types/error.type";

export const getInventorySheetsByDate = async (
  params?: GetInventorySheetsByDateParams
): Promise<GetInventorySheetPayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const url = new URL(`${process.env.API_URL}/inventory/user/date`);
  
  if (params?.startDate) url.searchParams.append("startDate", params.startDate);
  if (params?.endDate) url.searchParams.append("endDate", params.endDate);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to fetch inventory sheets"
    );
  }

  return response.json();
};