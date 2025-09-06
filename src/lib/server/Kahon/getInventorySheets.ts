"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  CashierInventorySheetResponse,
  InventorySheetWithData,
} from "../../../../utils/types/kahon.type";

export const getInventorySheetsByDate = async (
  date?: string
): Promise<CashierInventorySheetResponse[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Default to current day if no date provided
  const getCurrentDateString = () => new Date().toISOString().split("T")[0];
  const finalDate = date || getCurrentDateString();

  console.log("getInventorySheetsByDate called with date:", finalDate);

  const searchParams = new URLSearchParams();
  searchParams.append("date", finalDate);

  const url = `${
    process.env.API_URL
  }/inventory/user/one-date?${searchParams.toString()}`;
  console.log("Fetching inventory from URL:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    cache: "no-store",
  });

  console.log("Inventory response status:", response.status);

  if (!response.ok) {
    if (response.status === 404) {
      console.log("No inventory sheets found for date");
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

export const getExpensesSheetsByDate = async (
  date?: string
): Promise<CashierInventorySheetResponse[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  // Default to current day if no date provided
  const getCurrentDateString = () => new Date().toISOString().split("T")[0];
  const finalDate = date || getCurrentDateString();

  const searchParams = new URLSearchParams();
  searchParams.append("date", finalDate);

  const response = await fetch(
    `${
      process.env.API_URL
    }/inventory/user/expenses/one-date?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      cache: "no-store",
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

// Legacy functions for backward compatibility
export const getInventorySheetsByDateRange = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CashierInventorySheetResponse[]> => {
  const date = params?.startDate || new Date().toISOString().split("T")[0];
  return getInventorySheetsByDate(date);
};

export const getExpensesSheetsByDateRange = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CashierInventorySheetResponse[]> => {
  const date = params?.startDate || new Date().toISOString().split("T")[0];
  return getExpensesSheetsByDate(date);
};
