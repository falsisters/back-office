"use server";

import { cookies } from "next/headers";
import type { GetInventorySheetPayload } from "../../../utils/types/inventory.type";
import type { NestApiError } from "../../../utils/types/error.type";

export const getInventorySheetWithData = async (
  sheetId: string
): Promise<GetInventorySheetPayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/sheet/${sheetId}`, {
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
        : error.message || "Failed to fetch inventory sheet data"
    );
  }

  return response.json();
};
