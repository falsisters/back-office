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

// Helper function to process dashboard summary data
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
      overallTotal: parseDecimalString(data.previousDaysProfit?.overallTotal || "0"),
      rawItems: processRawItems(data.previousDaysProfit?.rawItems),
    },
    currentDayProfit: {
      sackTotal: parseDecimalString(data.currentDayProfit?.sackTotal || "0"),
      asinTotal: parseDecimalString(data.currentDayProfit?.asinTotal || "0"),
      overallTotal: parseDecimalString(data.currentDayProfit?.overallTotal || "0"),
      rawItems: processRawItems(data.currentDayProfit?.rawItems),
    },
    overallProfit: parseDecimalString(data.overallProfit || "0"),
  };
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
// Uses sequential requests to avoid exhausting database connection pool
export const getAllProfitsByCashier = async (cashierId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");
  
  // Use Manila time for date calculations
  // Manila is UTC+8
  const nowUTC = Date.now();
  const nowInManila = new Date(nowUTC + 8 * 60 * 60 * 1000);
  
  // Get today's date in Manila
  const todayYear = nowInManila.getUTCFullYear();
  const todayMonth = nowInManila.getUTCMonth();
  const todayDay = nowInManila.getUTCDate();
  
  // Calculate 30 days ago in Manila
  const thirtyDaysAgoManila = new Date(Date.UTC(todayYear, todayMonth, todayDay - 30));

  const allProfitItems: any[] = [];
  let sackTotal = 0;
  let asinTotal = 0;

  // Format dates for API (YYYY-MM-DD in Manila time)
  const formatManilaDate = (date: Date) => {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  };

  console.log(
    `🔄 Fetching profits from ${formatManilaDate(thirtyDaysAgoManila)} to ${formatManilaDate(nowInManila)} (Manila time)`
  );

  // Collect all dates first
  const dates: string[] = [];
  for (
    let d = new Date(thirtyDaysAgoManila);
    d <= nowInManila;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    dates.push(formatManilaDate(d));
  }

  // Process dates sequentially to avoid connection pool exhaustion
  // Using batch size of 3 for controlled parallelism
  const BATCH_SIZE = 3;
  
  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(dateStr =>
      getProfitsByCashier(cashierId, dateStr).catch((error) => {
        console.log(
          `⚠️ Failed to fetch profits for ${dateStr}:`,
          error.message
        );
        return null;
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const result of batchResults) {
      if (result && result.rawItems) {
        allProfitItems.push(...result.rawItems);
        if (result.sacks?.totalProfit)
          sackTotal += parseDecimalString(result.sacks.totalProfit);
        if (result.asin?.totalProfit)
          asinTotal += parseDecimalString(result.asin.totalProfit);
      }
    }
    
    console.log(`🔄 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(dates.length / BATCH_SIZE)}`);
  }

  console.log("✅ Combined rawItems count:", allProfitItems.length);

  const correctedProfitItems = allProfitItems.map((item: any) => {
    if (item.saleDate) {
      return {
        ...item,
        saleDate: typeof item.saleDate === 'string' ? item.saleDate : item.saleDate,
        originalSaleDate: item.saleDate, // Keep original for debugging
      };
    }
    return item;
  });

  console.log("✅ PROFITS: Raw server date data (no conversion applied):");
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
};

/**
 * NEW: Get profit dashboard summary with Previous Days (MTD) and Current Day breakdown
 * This uses a single optimized backend query instead of looping through 30 days
 */
export const getProfitDashboardSummary = async (
  cashierId: string,
  date: string
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  console.log("🔗 API CALL: getProfitDashboardSummary");
  console.log(
    "🔗 API URL:",
    `${process.env.API_URL}/profit/cashier/${cashierId}/dashboard-summary?date=${date}`
  );

  const response = await fetch(
    `${process.env.API_URL}/profit/cashier/${cashierId}/dashboard-summary?date=${date}`,
    {
      headers: { Authorization: `Bearer ${accessToken.value}` },
      method: "GET",
      cache: "no-store", // Always get fresh data
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
  console.log("✅ API RESPONSE (Dashboard Summary):", result);

  return processDashboardSummaryData(result);
};
