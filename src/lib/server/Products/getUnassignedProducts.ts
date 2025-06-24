"use server";
import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { GetAllProductsResponse } from "../../../../utils/types/Products/getAllProductsByUserId.type";

export const getUnassignedProducts = async (): Promise<{
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
      `${process.env.API_URL}/product/user/unassigned`,
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
          : data.message || "Failed to get unassigned products"
      );
    }

    const data: GetAllProductsResponse = await response.json();
    return { data };
  } catch (error) {
    console.error("Get unassigned products error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};
