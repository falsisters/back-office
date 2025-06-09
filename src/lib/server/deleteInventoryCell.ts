"use server";

import { cookies } from "next/headers";
import type { NestApiError } from "../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const deleteInventoryCell = async (cellId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/inventory/user/cell/${cellId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to delete inventory cell"
    );
  }
  revalidatePath("/kahon");
  return response.json();
};
