"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const editAttachment = async (
  id: string, 
  name: string
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  try {
    const response = await fetch(`${process.env.API_URL}/attachment/user/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "text/plain",
      },
      body: name,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error("Failed to edit attachment");
    }

    revalidatePath("/attachments");
    return await response.json();
  } catch (error) {
    console.error("Edit attachment error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to edit attachment"
    );
  }
};