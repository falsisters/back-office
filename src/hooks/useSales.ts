"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { GetAllSalesByUserIdPayload } from "../../utils/types/Sales/getAllSalesByUserId.type";
import type { GetVoidedSalesByUserPayload } from "../../utils/types/Sales/getVoidedSalesByUser.type";

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
    product: { id: string; name: string };
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

async function fetchSales(date?: string): Promise<GetAllSalesByUserIdPayload> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(`/api/sale/user?${params}`);
  return Array.isArray(data) ? data : [];
}

async function fetchSalesByCashier(
  cashierId: string,
  date?: string
): Promise<GetAllSalesByUserIdPayload> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(`/api/sale/cashier/${cashierId}?${params}`);
  return Array.isArray(data) ? data : [];
}

async function fetchVoidedSales(): Promise<GetVoidedSalesByUserPayload> {
  const { data } = await apiClient.get("/api/sale/voided");
  return Array.isArray(data) ? data : [];
}

async function fetchSalesCheckByCashier(
  cashierId: string,
  date?: string
): Promise<SalesCheckItem[]> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(`/api/sales-check/cashier/${cashierId}?${params}`);
  return Array.isArray(data) ? data : [];
}

async function fetchTotalSalesByCashier(
  cashierId: string,
  date?: string
): Promise<TotalSalesResponse> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(`/api/sales-check/cashier/${cashierId}/total?${params}`);
  return data;
}

async function deleteSaleFn(id: string): Promise<void> {
  await apiClient.delete(`/api/sale/${id}`);
}

export function useSales(date?: string) {
  return useQuery({
    queryKey: ["sales", "user", { date }],
    queryFn: () => fetchSales(date),
  });
}

export function useSalesByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["sales", "cashier", cashierId, { date }],
    queryFn: () => fetchSalesByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useVoidedSales() {
  return useQuery({
    queryKey: ["sales", "voided"],
    queryFn: fetchVoidedSales,
  });
}

export function useSalesCheckByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["sales", "check", cashierId, { date }],
    queryFn: () => fetchSalesCheckByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useTotalSalesByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["sales", "total", cashierId, { date }],
    queryFn: () => fetchTotalSalesByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSaleFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
