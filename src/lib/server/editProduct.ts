"use server";

import { cookies } from "next/headers";
import { EditProductFormData } from "../../../utils/types/editProduct.type";
import { NestApiError } from "../../../utils/types/error.type";

export const editProduct = async (
  id: string,
  formData: EditProductFormData
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/product/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify(formData.product),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occured"
    );
  }

  return response.json();
};
