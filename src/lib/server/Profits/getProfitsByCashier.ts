"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";

// Helper function to convert decimal strings to numbers
const parseDecimalString = (value: string | number): number => {
  if (typeof value === "number") return value;
  return parseFloat(value) || 0;
};

// Helper function to process profit data from backend
const processProfitData = (data: any) => {
  if (!data) return data;

  // Convert decimal strings to numbers for frontend consumption
  const processedData = {
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

  return processedData;
};

export const getProfitsByCashier = async (cashierId: string, date?: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const queryParams = new URLSearchParams();
  if (date) queryParams.append("date", date);

  console.log("🔗 API CALL: getProfitsByCashier");
  console.log(
    "🔗 API URL:",
    `${
      process.env.API_URL
    }/profit/cashier/${cashierId}?${queryParams.toString()}`
  );
  console.log("🔗 API Params:", {
    cashierId,
    date,
    queryString: queryParams.toString(),
  });

  const response = await fetch(
    `${
      process.env.API_URL
    }/profit/cashier/${cashierId}?${queryParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken.value}` },
      method: "GET",
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    const data: NestApiError = await response.json();
    console.error("❌ API ERROR:", data);
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Unexpected error occurred"
    );
  }

  const result = await response.json();
  console.log("✅ API RESPONSE:", result);
  console.log("✅ API rawItems count:", result?.rawItems?.length || 0);

  return processProfitData(result);
};

// NEW: Function to get ALL profits by fetching multiple date ranges
export const getAllProfitsByCashier = async (cashierId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const allProfitItems: any[] = [];
  let sackTotal = 0;
  let asinTotal = 0;

  console.log(
    `🔄 Fetching profits from ${thirtyDaysAgo.toISOString().split("T")[0]} to ${
      today.toISOString().split("T")[0]
    }`
  );

  // Fetch data for each day in the range
  const promises = [];
  for (
    let d = new Date(thirtyDaysAgo);
    d <= today;
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = d.toISOString().split("T")[0];
    promises.push(
      getProfitsByCashier(cashierId, dateStr).catch((error) => {
        console.log(
          `⚠️ Failed to fetch profits for ${dateStr}:`,
          error.message
        );
        return null; // Return null for failed requests
      })
    );
  }

  try {
    const results = await Promise.all(promises);

    for (const result of results) {
      if (result && result.rawItems) {
        allProfitItems.push(...result.rawItems);
        if (result.sacks?.totalProfit)
          sackTotal += parseDecimalString(result.sacks.totalProfit);
        if (result.asin?.totalProfit)
          asinTotal += parseDecimalString(result.asin.totalProfit);
      }
    }

    console.log("✅ Combined rawItems count:", allProfitItems.length);

    const correctedProfitItems = allProfitItems.map((item: any) => {
      if (item.saleDate) {
        const originalDate = new Date(item.saleDate);
        const correctedDate = new Date(
          originalDate.getTime() - 8 * 60 * 60 * 1000
        );
        return {
          ...item,
          saleDate: correctedDate.toISOString(),
          originalSaleDate: item.saleDate,
        };
      }
      return item;
    });

    console.log("✅ Date correction applied - Before/After comparison:");
    console.log(
      "✅ Original profit items by date:",
      allProfitItems.reduce((acc: any, item: any) => {
        const date = item.saleDate
          ? new Date(item.saleDate).toDateString()
          : "Unknown";
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
    );
    console.log(
      "✅ Corrected profit items by date:",
      correctedProfitItems.reduce((acc: any, item: any) => {
        const date = item.saleDate
          ? new Date(item.saleDate).toDateString()
          : "Unknown";
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
    );

    const processedResult = {
      sacks: {
        items: [],
        totalProfit: sackTotal,
      },
      asin: {
        items: [],
        totalProfit: asinTotal,
      },
      overallTotal: sackTotal + asinTotal,
      rawItems: correctedProfitItems,
    };

    return processProfitData(processedResult);
  } catch (error) {
    console.error("❌ Error fetching all profits:", error);
    throw error;
  }
};
