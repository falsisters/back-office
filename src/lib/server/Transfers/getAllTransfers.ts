"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { GetAllTransfersResponse } from "../../../../utils/types/Transfers/getAllTransfers.type";

export const getAllTransfers = async (): Promise<{
  data?: GetAllTransfersResponse;
  error?: string;
}> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      console.error("No access token found in cookies");
      throw new Error("Unauthorized");
    }

    console.log("Fetching transfers from:", `${process.env.API_URL}/transfer`);
    console.log("Using access token:", accessToken.value ? "*****" : "MISSING");

    const response = await fetch(`${process.env.API_URL}/transfer`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Fetch response status:", response.status);

    if (!response.ok) {
      const data: NestApiError = await response.json();
      console.error("Backend error response:", {
        status: response.status,
        url: response.url,
        errorData: data,
      });
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Unexpected error occurred"
      );
    }

    const data: GetAllTransfersResponse = await response.json();
    return { data };
  } catch (error) {
    console.error("Get all transfers error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    return { error: message };
  }
};
