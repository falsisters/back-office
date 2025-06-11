"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import {
  CashierInventorySheetResponse,
  InventorySheetWithData,
  DateRangeQueryType,
} from "../../../utils/types/kahon.type";

export const getInventorySheetsByDateRange = async (
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
    `${process.env.API_URL}/inventory/user/date?${searchParams.toString()}`,
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
      error.message?.toString() || "Failed to fetch inventory sheets"
    );
  }

  const payload: CashierInventorySheetResponse[] = await response.json();
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
