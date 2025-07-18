"use server";

import { revalidatePath } from "next/cache";
import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";

export const exportDatabase = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/database/export`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to export database");
  }

  revalidatePath("/");
  return await response.arrayBuffer();
};
