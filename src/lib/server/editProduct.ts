"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const editProduct = async (id: string, formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${process.env.API_URL}/product/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data: NestApiError = await response.json();
      console.error("Backend error:", data);
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occurred"
      );
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return response.json();
  } catch (error) {
    console.error("Edit product error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};