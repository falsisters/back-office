// src/hooks/useKahonSheet.ts
"use client"

import { useState, useEffect, useCallback } from "react";
import { getUserSheetsByDate } from "@/lib/server/getSheetsByDateRange";
import type { SheetWithData, DateRangeParams } from "../../utils/types/kahon.type";
import type { DateRange } from "react-day-picker";

export const useKahonSheet = () => {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [sheetData, setSheetData] = useState<SheetWithData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSheetData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    setError(null);
    
    try {
      const params: DateRangeParams = {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      };
      
      const data = await getUserSheetsByDate(params);
      setSheetData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sheet data");
      setSheetData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSheetData();
  }, [fetchSheetData]);

  return {
    dateRange,
    setDateRange,
    sheetData,
    loading,
    error,
    refresh: fetchSheetData
  };
};