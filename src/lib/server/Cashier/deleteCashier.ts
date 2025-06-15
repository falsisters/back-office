"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const deleteCashier = async (id: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/cashier/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    if (response.status === 204) return;

    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }
  revalidatePath("/cashiers");
};
