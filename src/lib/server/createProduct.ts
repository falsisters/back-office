"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";

export const createProduct = async (formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    // Check if the file field exists and has content
    const imageFile = formData.get("picture");
    console.log("imageFile", imageFile);
    if (!imageFile || (imageFile instanceof File && imageFile.size === 0)) {
      throw new Error("Image file is required");
    }

    const response = await fetch(`${process.env.API_URL}/product/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        // Do not set the "Content-Type" header here.
      },
      body: formData,
    });

    if (!response.ok) {
      const data: NestApiError = await response.json();
      console.error("Backend error:", data);
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occured"
      );
    }

    return response.json();
  } catch (error) {
    console.error("Create product error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occured";
    return { error: message };
  }
};
