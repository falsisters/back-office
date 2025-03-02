"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import { GetAllDeliveriesByUserIdPayload } from "../../../utils/types/getAllDeliveriesByUserId.type";

export const getAllDeliveriesByUserId = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/delivery/user`, {
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

  const payload: GetAllDeliveriesByUserIdPayload = await response.json();

  return payload;
};
