"use server";

import { cookies } from "next/headers";
import type { UpdateInventoryCellParams } from "../../../utils/types/inventory.type";
import type { NestApiError } from "../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const updateInventoryCell = async (id: string, payload: UpdateInventoryCellParams) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/user/cell/${id}`, {
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
        : error.message || "Failed to update inventory cell"
    );
  }
  revalidatePath("/kahon");
  return response.json();
};
