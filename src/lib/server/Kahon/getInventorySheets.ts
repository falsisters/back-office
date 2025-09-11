"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  CashierInventorySheetResponse,
  InventorySheetWithData,
  DateRangeQueryType,
} from "../../../../utils/types/kahon.type";

export const getInventorySheetsByDateRange = async (
  params?: DateRangeQueryType
): Promise<CashierInventorySheetResponse[]> => {
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

  console.log("getInventorySheetsByDateRange called with params:", finalParams);

  const searchParams = new URLSearchParams();
  if (finalParams.startDate) {
    searchParams.append("startDate", finalParams.startDate);
  }
  if (finalParams.endDate) {
    searchParams.append("endDate", finalParams.endDate);
  }

  const url = `${
    process.env.API_URL
  }/inventory/user/date?${searchParams.toString()}`;
  console.log("Fetching inventory from URL:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    cache: "no-store", // Disable caching
  });

  console.log("Inventory response status:", response.status);

  if (!response.ok) {
    if (response.status === 404) {
      console.log("No inventory sheets found for date range");
      return [];
    }

    const errorText = await response.text();
    console.error("Inventory API error response:", errorText);

    try {
      const error: NestApiError = JSON.parse(errorText);
      throw new Error(
        error.message?.toString() || "Failed to fetch inventory sheets"
      );
    } catch (parseError) {
      throw new Error(
        `Failed to fetch inventory sheets: ${response.status} ${response.statusText}`
      );
    }
  }

  const payload: CashierInventorySheetResponse[] = await response.json();
  console.log("Successfully fetched inventory sheets:", payload);
  return payload;
};

export const getExpensesSheetsByDateRange = async (
  params?: DateRangeQueryType
): Promise<CashierInventorySheetResponse[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Default to current day if no params provided
  const today = new Date().toISOString().split("T")[0];
  const defaultParams = {
    startDate: today,
    endDate: today,
  };

  const finalParams = params || defaultParams;

  const searchParams = new URLSearchParams();
  if (finalParams.startDate)
    searchParams.append("startDate", finalParams.startDate);
  if (finalParams.endDate) searchParams.append("endDate", finalParams.endDate);

  const response = await fetch(
    `${
      process.env.API_URL
    }/inventory/user/expenses/date?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      cache: "no-store", // Disable caching
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }

    const error: NestApiError = await response.json();
    throw new Error(
      error.message?.toString() || "Failed to fetch expenses sheets"
    );
  }

  const payload: CashierInventorySheetResponse[] = await response.json();
  return payload;
};

export const getInventorySheetById = async (
  sheetId: string
): Promise<InventorySheetWithData | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/sheet/${sheetId}`,
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
    throw new Error(
      error.message?.toString() || "Failed to fetch inventory sheet"
    );
  }

  const payload: InventorySheetWithData = await response.json();
  return payload;
};

export const getInventorySheetByCashierId = async (
  cashierId: string
): Promise<CashierInventorySheetResponse | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(
    `${process.env.API_URL}/inventory/user/cashier/${cashierId}`,
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
    throw new Error(
      error.message?.toString() || "Failed to fetch inventory sheet"
    );
  }

  const payload: CashierInventorySheetResponse = await response.json();
  return payload;
};
