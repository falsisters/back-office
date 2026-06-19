"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

const parseDecimalString = (value: string | number): number => {
  if (typeof value === "number") return value;
  return parseFloat(value) || 0;
};

const processProfitData = (data: any) => {
  if (!data) return data;

  return {
    ...data,
    sacks: {
      ...data.sacks,
      totalProfit: parseDecimalString(data.sacks?.totalProfit || "0"),
      items:
        data.sacks?.items?.map((item: any) => ({
          ...item,
          profitPerUnit: parseDecimalString(item.profitPerUnit || "0"),
          totalQuantity: parseDecimalString(item.totalQuantity || "0"),
          totalProfit: parseDecimalString(item.totalProfit || "0"),
        })) || [],
    },
    asin: {
      ...data.asin,
      totalProfit: parseDecimalString(data.asin?.totalProfit || "0"),
      items:
        data.asin?.items?.map((item: any) => ({
          ...item,
          profitPerUnit: parseDecimalString(item.profitPerUnit || "0"),
          totalQuantity: parseDecimalString(item.totalQuantity || "0"),
          totalProfit: parseDecimalString(item.totalProfit || "0"),
        })) || [],
    },
    overallTotal: parseDecimalString(data.overallTotal || "0"),
    rawItems:
      data.rawItems?.map((item: any) => ({
        ...item,
        quantity: parseDecimalString(item.quantity || "0"),
        profitPerUnit: parseDecimalString(item.profitPerUnit || "0"),
        totalProfit: parseDecimalString(item.totalProfit || "0"),
      })) || [],
  };
};

const processDashboardSummaryData = (data: any) => {
  if (!data) return data;

  const processRawItems = (items: any[]) =>
    items?.map((item: any) => ({
      ...item,
      quantity: parseDecimalString(item.quantity || "0"),
      profitPerUnit: parseDecimalString(item.profitPerUnit || "0"),
      totalProfit: parseDecimalString(item.totalProfit || "0"),
    })) || [];

  return {
    date: data.date,
    previousDaysProfit: {
      sackTotal: parseDecimalString(data.previousDaysProfit?.sackTotal || "0"),
      asinTotal: parseDecimalString(data.previousDaysProfit?.asinTotal || "0"),
      overallTotal: parseDecimalString(
        data.previousDaysProfit?.overallTotal || "0"
      ),
      rawItems: processRawItems(data.previousDaysProfit?.rawItems),
    },
    currentDayProfit: {
      sackTotal: parseDecimalString(data.currentDayProfit?.sackTotal || "0"),
      asinTotal: parseDecimalString(data.currentDayProfit?.asinTotal || "0"),
      overallTotal: parseDecimalString(
        data.currentDayProfit?.overallTotal || "0"
      ),
      rawItems: processRawItems(data.currentDayProfit?.rawItems),
    },
    overallProfit: parseDecimalString(data.overallProfit || "0"),
  };
};

async function fetchProfitsByCashier(cashierId: string, date?: string) {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(
    `/api/profit/cashier/${cashierId}?${params}`
  );
  return processProfitData(data);
}

async function fetchProfitDashboardSummary(cashierId: string, date: string) {
  const { data } = await apiClient.get(
    `/api/profit/cashier/${cashierId}/dashboard-summary?date=${date}`
  );
  return processDashboardSummaryData(data);
}

export function useProfitsByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["profits", "cashier", cashierId, { date }],
    queryFn: () => fetchProfitsByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useProfitDashboardSummary(cashierId: string, date: string) {
  return useQuery({
    queryKey: ["profits", "dashboard", cashierId, date],
    queryFn: () => fetchProfitDashboardSummary(cashierId, date),
    enabled: !!cashierId && !!date,
  });
}
