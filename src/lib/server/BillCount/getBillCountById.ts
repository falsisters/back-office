"use server";

import { cookies } from "next/headers";
import type { GetBillCountByIdPayload } from "../../../../utils/types/BillCount/getBillCountById.type";
import type { NestApiError } from "../../../../utils/types/error.type";

export const getBillCountById = async (
  id: string
): Promise<GetBillCountByIdPayload> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/bills/user/${id}`, {
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
