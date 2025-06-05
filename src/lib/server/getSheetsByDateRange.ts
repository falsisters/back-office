// src/lib/server/getUserSheetsByDate.ts
"use server";

import { cookies } from "next/headers";
import type { GetUserSheetsByDatePayload } from "../../../utils/types/getSheetsByDateRange.type";
import { GetUserSheetsByDateParams } from "../../../utils/types/getSheetsByDateRange.type";

import type { NestApiError } from "../../../utils/types/error.type";

export const getUserSheetsByDate = async (
  params?: GetUserSheetsByDateParams
): Promise<GetUserSheetsByDatePayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const url = new URL(`${process.env.API_URL}/sheet/user/date`);
  
  if (params?.startDate) {
    url.searchParams.append("startDate", params.startDate);
  }
  
  if (params?.endDate) {
    url.searchParams.append("endDate", params.endDate);
  }

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
        : error.message || "Failed to fetch sheets"
    );
  }

  return response.json();
};