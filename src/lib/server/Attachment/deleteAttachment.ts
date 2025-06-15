"use server";

import { revalidatePath } from "next/cache";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const deleteAttachment = async (id: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/attachment/user/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to delete attachment");
  }

  revalidatePath("/attachments");
  return await response.json();
};
