"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";

export interface SalesCheckItem {
  productName: string;
  items: Array<{
    quantity: string;
    unitPrice: string;
    totalAmount: string;
    paymentMethod: string;
    isSpecialPrice: boolean;
    isDiscounted: boolean;
    discountedPrice: string | null;
    formattedSale: string;
  }>;
  totalQuantity: string;
  totalAmount: string;
  paymentTotals: {
    cash: string;
    check: string;
    bankTransfer: string;
  };
}

export interface TotalSalesResponse {
  items: Array<{
    id: string;
    saleId: string;
    quantity: string;
    product: {
      id: string;
      name: string;
    };
    priceType: string;
    unitPrice: string;
    totalAmount: string;
    paymentMethod: string;
    isSpecialPrice: boolean;
    isDiscounted: boolean;
    discountedPrice: string | null;
    saleDate: Date;
    formattedTime: string;
    formattedSale: string;
  }>;
  summary: {
    totalQuantity: string;
    totalAmount: string;
    paymentTotals: {
      cash: string;
      check: string;
      bankTransfer: string;
    };
  };
}

export const getSalesCheckByCashier = async (
  cashierId: string,
  date?: string,
  bypassCache: boolean = false
): Promise<SalesCheckItem[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const fetchOptions: RequestInit = {
    method: "GET",
  };

  let url = `${process.env.API_URL}/sales-check/cashier`;
  const params = new URLSearchParams();

  if (date) {
    params.append("date", date);
  }

  if (bypassCache) {
    params.append("_t", Date.now().toString());
    fetchOptions.headers = {
      Authorization: `Bearer ${accessToken.value}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    fetchOptions.cache = "no-store";
  } else {
    fetchOptions.headers = { Authorization: `Bearer ${accessToken.value}` };
    fetchOptions.cache = "no-cache";
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  return response.json();
};

export const getTotalSalesByCashier = async (
  cashierId: string,
  date?: string,
  bypassCache: boolean = false
): Promise<TotalSalesResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const fetchOptions: RequestInit = {
    method: "GET",
  };

  let url = `${process.env.API_URL}/sales-check/cashier/total`;
  const params = new URLSearchParams();

  if (date) {
    params.append("date", date);
  }

  if (bypassCache) {
    params.append("_t", Date.now().toString());
    fetchOptions.headers = {
      Authorization: `Bearer ${accessToken.value}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    fetchOptions.cache = "no-store";
  } else {
    fetchOptions.headers = { Authorization: `Bearer ${accessToken.value}` };
    fetchOptions.cache = "no-cache";
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  const data = await response.json();

  // Backend already converts saleDate to Manila time using convertToManilaTime()
  // Just parse the date string to Date object, no additional timezone adjustment needed
  data.items = data.items.map((item: any) => ({
    ...item,
    saleDate: new Date(item.saleDate),
  }));

  return data;
};

export const getAllCashierSales = async (
  date?: string,
  bypassCache: boolean = false
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const fetchOptions: RequestInit = {
    method: "GET",
  };

  let url = `${process.env.API_URL}/sales-check/cashiers/all`;
  const params = new URLSearchParams();

  if (date) {
    params.append("date", date);
  }

  if (bypassCache) {
    params.append("_t", Date.now().toString());
    fetchOptions.headers = {
      Authorization: `Bearer ${accessToken.value}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    fetchOptions.cache = "no-store";
  } else {
    fetchOptions.headers = { Authorization: `Bearer ${accessToken.value}` };
    fetchOptions.cache = "no-cache";
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const data: NestApiError = await response.json();
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  return response.json();
};
