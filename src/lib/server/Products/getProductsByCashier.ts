"use server";
import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { GetAllProductsResponse } from "../../../../utils/types/Products/getAllProductsByUserId.type";

export const getProductsByCashier = async (
  cashierId: string
): Promise<{
  data?: GetAllProductsResponse;
  error?: string;
}> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.API_URL}/product/cashier/${cashierId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const data: NestApiError = await response.json();
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occurred"
      );
    }

    const data: GetAllProductsResponse = await response.json();
    return { data };
  } catch (error) {
    console.error("Get products by cashier error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};
