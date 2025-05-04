"use server";

import { revalidatePath } from "next/cache";
import { EditAttachmentType } from "../../../utils/types/editAttachment.type";
import { NestApiError } from "../../../utils/types/error.type";
import { cookies } from "next/headers";

export const editAttachment = async (id: string, formData: EditAttachmentType) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/attachment/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to edit attachment");
  }

  revalidatePath("/attachments");
  return await response.json();
};