// @/lib/server/getAllSalesByUserId.ts
"use server";

import { cookies } from "next/headers";
import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { NestApiError } from "../../../utils/types/error.type";

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

  return await response.json() as GetAllSalesByUserIdPayload;
};