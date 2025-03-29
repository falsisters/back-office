"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { GetAllProductsResponse } from "../../../utils/types/getAllProductsByUserId.type";

export const getAllProducts = async (): Promise<{ data?: GetAllProductsResponse; error?: string }> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${process.env.API_URL}/product/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
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

    const data: GetAllProductsResponse = await response.json();
    return { data };
  } catch (error) {
    console.error("Get all products error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};