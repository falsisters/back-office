"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  CashierSheetResponse,
  SheetWithData,
} from "../../../../utils/types/kahon.type";

export const getKahonSheetsByDate = async (
  date?: string
): Promise<CashierSheetResponse[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Default to current day if no date provided
  const getCurrentDateString = () => new Date().toISOString().split("T")[0];
  const finalDate = date || getCurrentDateString();

  console.log("getKahonSheetsByDate called with date:", finalDate);

  const searchParams = new URLSearchParams();
  searchParams.append("date", finalDate);

  const url = `${
    process.env.API_URL
  }/sheet/user/one-date?${searchParams.toString()}`;
  console.log("Fetching from URL:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    cache: "no-store",
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    if (response.status === 404) {
      console.log("No sheets found for date");
      return [];
    }

    const errorText = await response.text();
    console.error("API error response:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        error.message?.toString() || "Failed to fetch Kahon sheets"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to fetch Kahon sheets: ${response.status} ${response.statusText}`
      );
    }
  }

  const payload: CashierSheetResponse[] = await response.json();
  console.log("Successfully fetched Kahon sheets:", payload);
  return payload;
};

export const getSheetById = async (
  sheetId: string
): Promise<SheetWithData | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/sheet/user/${sheetId}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    cache: "no-store", // Disable caching
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to fetch sheet");
  }

  const payload: SheetWithData = await response.json();
  return payload;
};

export const getKahonSheetByCashierId = async (
  cashierId: string
): Promise<CashierSheetResponse | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/cashier/${cashierId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      cache: "no-store", // Disable caching
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to fetch sheet");
  }

  const payload: CashierSheetResponse = await response.json();
  return payload;
};

// Legacy function for backward compatibility
export const getKahonSheetsByDateRange = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CashierSheetResponse[]> => {
  // Convert to single date - use startDate if provided, otherwise current date
  const date = params?.startDate || new Date().toISOString().split("T")[0];
  return getKahonSheetsByDate(date);
};
