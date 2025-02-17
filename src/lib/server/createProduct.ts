"use server";

import { cookies } from "next/headers";
import { CreateProductFormData } from "../../../utils/types/createProduct.type";
import { NestApiError } from "../../../utils/types/error.type";

export const createProduct = async (formData: CreateProductFormData) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/product/create`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    method: "POST",
    body: JSON.stringify(formData),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(data.message[0] || "Unexpected error occured");
  }

  return response.json();
};
