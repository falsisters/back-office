"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { CreateBillCountType } from "../../utils/types/BillCount/createBillCount.type";
import type { UpdateBillCountType } from "../../utils/types/BillCount/editBillCount.type";
import type { GetBillCountForDatePayload } from "../../utils/types/BillCount/getBillCountByDate.type";
import type { GetBillCountByIdPayload } from "../../utils/types/BillCount/getBillCountById.type";

async function fetchUserBillCounts(
  date?: string
): Promise<GetBillCountForDatePayload | null> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(`/api/bills/user?${params}`);
  return data || null;
}

async function fetchBillCountsByCashier(
  cashierId: string,
  date?: string
): Promise<GetBillCountForDatePayload | null> {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  const { data } = await apiClient.get(
    `/api/bills/cashier/${cashierId}?${params}`
  );
  return data || null;
}

async function fetchBillCount(
  id: string
): Promise<GetBillCountByIdPayload> {
  const { data } = await apiClient.get(`/api/bills/${id}`);
  return data;
}

async function createBillCountFn(
  data: CreateBillCountType
): Promise<GetBillCountForDatePayload> {
  const { data: response } = await apiClient.post("/api/bills/user", data);
  return response;
}

async function createCashierBillCountFn({
  cashierId,
  data,
}: {
  cashierId: string;
  data: CreateBillCountType;
}): Promise<GetBillCountForDatePayload> {
  const { data: response } = await apiClient.post(
    `/api/bills/cashier/${cashierId}`,
    data
  );
  return response;
}

async function editBillCountFn({
  id,
  data,
}: {
  id: string;
  data: UpdateBillCountType;
}): Promise<GetBillCountForDatePayload> {
  const { data: response } = await apiClient.patch(`/api/bills/${id}`, data);
  return response;
}

async function editCashierBillCountFn({
  cashierId,
  id,
  data,
}: {
  cashierId: string;
  id: string;
  data: UpdateBillCountType;
}): Promise<GetBillCountForDatePayload> {
  const { data: response } = await apiClient.patch(
    `/api/bills/cashier/${cashierId}/${id}`,
    data
  );
  return response;
}

async function deleteBillCountFn(id: string): Promise<void> {
  await apiClient.delete(`/api/bills/${id}`);
}

export function useUserBillCounts(date?: string) {
  return useQuery({
    queryKey: ["billCounts", "user", { date }],
    queryFn: () => fetchUserBillCounts(date),
  });
}

export function useBillCountsByCashier(cashierId: string, date?: string) {
  return useQuery({
    queryKey: ["billCounts", "cashier", cashierId, { date }],
    queryFn: () => fetchBillCountsByCashier(cashierId, date),
    enabled: !!cashierId,
  });
}

export function useBillCount(id: string) {
  return useQuery({
    queryKey: ["billCounts", id],
    queryFn: () => fetchBillCount(id),
    enabled: !!id,
  });
}

export function useCreateBillCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBillCountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billCounts"] });
      toast.success("Bill count created successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useCreateCashierBillCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashierBillCountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billCounts"] });
      toast.success("Bill count created successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditBillCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editBillCountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billCounts"] });
      toast.success("Bill count updated successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditCashierBillCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCashierBillCountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billCounts"] });
      toast.success("Bill count updated successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteBillCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBillCountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billCounts"] });
      toast.success("Bill count deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
