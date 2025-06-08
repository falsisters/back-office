// src/lib/server/getSheetWithData.ts
"use server";

import { cookies } from "next/headers";
import type { SheetWithDataPayload } from "../../../utils/types/sheet.type";
import type { NestApiError } from "../../../utils/types/error.type";

export const getSheetWithData = async (sheetId: string): Promise<SheetWithDataPayload | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sheet/${sheetId}`, {
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
        : error.message || "Failed to fetch sheet data"
    );
  }

  return response.json();
};