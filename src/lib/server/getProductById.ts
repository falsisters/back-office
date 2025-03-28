"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { GetProductByIdResponse } from "../../../utils/types/getProductById.type";

export const getProductById = async (id: string): Promise<{ data?: GetProductByIdResponse; error?: string }> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    if (!id) {
        throw new Error("Invalid product ID");
    }
    
    const response = await fetch(`${process.env.API_URL}/product/${id}`, {

      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    if (!response.ok) {
      const data: NestApiError = await response.json();
      console.error("Backend error:", data);
      console.error("Product not found:", data);
      throw new Error(

        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occurred"
      );
    }

    const data: GetProductByIdResponse = await response.json();
    return { data };
  } catch (error) {
    console.error("Get product by ID error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};
