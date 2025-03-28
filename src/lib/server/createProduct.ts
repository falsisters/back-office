"use server";

import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";

export const createProduct = async (formData: FormData, productData: any) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");
    if (!accessToken) throw new Error("Unauthorized");

    const response = await fetch(`${process.env.API_URL}/product/create`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify({
        ...productData,
        formData
      })
    });

    if (!response.ok) {
      const error: NestApiError = await response.json();
      throw new Error(error.message?.toString() || "Failed to create product");
    }

    return response.json();
  } catch (error) {
    console.error("Create product error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create product"
    );
  }
};