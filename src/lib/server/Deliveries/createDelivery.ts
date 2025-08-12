"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { CreateDeliveryDto } from "../../../../utils/types/Deliveries/createDelivery.type";
import { revalidatePath } from "next/cache";

export const createDelivery = async (createDeliveryDto: CreateDeliveryDto) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/delivery/create`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(createDeliveryDto),
    cache: "no-cache",
  });

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  revalidatePath("/deliveries");
  return response.json();
};
