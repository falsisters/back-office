"use server";

import { cookies } from "next/headers";
import type { GetBillCountForDatePayload } from "../../../../utils/types/BillCount/getBillCountByDate.type";
import type { NestApiError } from "../../../../utils/types/error.type";

export const getUserBillCountForDate = async (
  date?: string
): Promise<GetBillCountForDatePayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const url = new URL(`${process.env.API_URL}/bills/user`);
  if (date) url.searchParams.append("date", date);

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
        : error.message || "Failed to fetch bill count"
    );
  }

  return response.json();
};
