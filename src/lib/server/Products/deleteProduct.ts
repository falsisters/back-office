"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const deleteProduct = async (id: string) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${process.env.API_URL}/product/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data: NestApiError = await response.json();
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occurred"
      );
    }

    revalidatePath("/products");
    return response.json();
  } catch (error) {
    console.error("Delete product error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    throw new Error(message);
  }
};
