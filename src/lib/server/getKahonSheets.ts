"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import {
  CashierSheetResponse,
  SheetWithData,
  DateRangeQueryType,
} from "../../../utils/types/kahon.type";

export const getKahonSheetsByDateRange = async (
  params?: DateRangeQueryType
): Promise<CashierSheetResponse[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Default to current day if no params provided
  const getCurrentDateString = () => new Date().toISOString().split("T")[0];
  const getNextDayString = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00.000Z");
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const today = getCurrentDateString();
  const defaultParams = {
    startDate: today,
    endDate: getNextDayString(today),
  };

  const finalParams = params || defaultParams;

  console.log("getKahonSheetsByDateRange called with params:", finalParams);

  const searchParams = new URLSearchParams();
  if (finalParams.startDate) {
    searchParams.append("startDate", finalParams.startDate);
  }
  if (finalParams.endDate) {
    searchParams.append("endDate", finalParams.endDate);
  }

  const url = `${process.env.API_URL}/sheet/user/date?${searchParams.toString()}`;
  console.log("Fetching from URL:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    cache: "no-store", // Disable caching
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    if (response.status === 404) {
      console.log("No sheets found for date range");
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
