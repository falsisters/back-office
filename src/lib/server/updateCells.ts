// src/lib/server/updateCells.ts
"use server";

import { cookies } from "next/headers";
import type { EditCellsPayload } from "../../../utils/types/sheet.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const updateCells = async (payload: EditCellsPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized"); 

  const response = await fetch(`${process.env.API_URL}/sheet/user/cells`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.value}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to update cells"
    );
  }
  revalidatePath("/kahon");
  return response.json();
};