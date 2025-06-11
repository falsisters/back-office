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

  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);

  const response = await fetch(
    `${process.env.API_URL}/sheet/user/date?${searchParams.toString()}`,
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
      error.message?.toString() || "Failed to fetch Kahon sheets"
    );
  }

  const payload: CashierSheetResponse[] = await response.json();
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
