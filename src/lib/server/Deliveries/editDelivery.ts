"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { EditDeliveryDto } from "../../../../utils/types/Deliveries/editDelivery.type";
import { revalidatePath } from "next/cache";

export const editDelivery = async (
  id: string,
  editDeliveryDto: EditDeliveryDto
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.API_URL}/delivery/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify(editDeliveryDto),
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
  revalidatePath(`/deliveries/${id}`);
  return response.json();
};
