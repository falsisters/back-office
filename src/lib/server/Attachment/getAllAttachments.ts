"use server";

import { GetAllAttachmentsPayload } from "../../../../utils/types/Attachment/getAllAttachments.type";
import { NestApiError } from "../../../../utils/types/error.type";
import { cookies } from "next/headers";

export const getAllAttachments =
  async (): Promise<GetAllAttachmentsPayload> => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) throw new Error("Unauthorized");

    const response = await fetch(`${process.env.API_URL}/attachment/user`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const error: NestApiError = await response.json();
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to fetch attachments"
      );
    }

    return response.json();
  };
