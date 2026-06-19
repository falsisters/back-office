"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { GetAllTransfersResponse } from "../../utils/types/Transfers/getAllTransfers.type";

async function fetchTransfers(): Promise<GetAllTransfersResponse> {
  const { data } = await apiClient.get("/api/transfer");
  return Array.isArray(data) ? data : [];
}

async function fetchTransfersByCashier(
  cashierId: string,
  date?: string
): Promise<GetAllTransfersResponse> {
  const base = `/api/transfer/cashier/${cashierId}`;
  const url = date
    ? `${base}/date?date=${encodeURIComponent(date)}`
    : base;
  const { data } = await apiClient.get(url);
  return Array.isArray(data) ? data : [];
}

export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: fetchTransfers,
  });
}

export function useTransfersByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["transfers", "cashier", cashierId, { date }],
    queryFn: () => fetchTransfersByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useStockStats() {
  return useQuery({
    queryKey: ["stocks", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/stock/statistics/user");
      return data;
    },
    staleTime: 30 * 1000,
  });
}
