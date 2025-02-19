"use server";

import { cookies } from "next/headers";
import { CreateProductFormData } from "../../../utils/types/createProduct.type";
import { NestApiError } from "../../../utils/types/error.type";

export const createProduct = async (formData: CreateProductFormData) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${process.env.API_URL}/product/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.product),
    });

    if (!response.ok) {
      const data: NestApiError = await response.json();
      console.error('Backend error:', data );
      throw new Error(data.message[0] || "Unexpected error occurred");
    }

    return response.json();
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};