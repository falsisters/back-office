"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { GetAllProductsByUserIdPayload } from "../../../utils/types/getAllProductsByUserId.type";

export const getAllProductsByUserId = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/product`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    method: "GET",
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occured"
    );
  }

  const payload: GetAllProductsByUserIdPayload = await response.json();

  return payload;
};
