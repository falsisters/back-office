"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { GetAllProductsResponse } from "../../../utils/types/getAllProductsByUserId.type";

export const getAllProducts = async (): Promise<{ data?: GetAllProductsResponse; error?: string }> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      console.error('No access token found in cookies');
      throw new Error("Unauthorized");
    }

    console.log('Fetching products from:', `${process.env.API_URL}/product/user`);
    console.log('Using access token:', accessToken.value ? '*****' : 'MISSING');

    const response = await fetch(`${process.env.API_URL}/product/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      },
    });

    console.log('Fetch response status:', response.status);

    if (!response.ok) {
      const data: NestApiError = await response.json();
      console.error("Backend error response:", {
        status: response.status,
        url: response.url,
        errorData: data
      });
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occurred"
      );
    }

    const data: GetAllProductsResponse = await response.json();
    console.log('Successfully fetched products:', {
      count: data.length,
      firstProduct: data[0]?.name || 'No products found'
    });
    return { data };
  } catch (error) {
    console.error("Get all products error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};