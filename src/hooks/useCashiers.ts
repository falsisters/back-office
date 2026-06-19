"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { CreateCashierType } from "../../utils/types/Cashier/createCashier.type";
import type { EditCashierType } from "../../utils/types/Cashier/editCashier.type";
import type { Cashier } from "../../utils/types/schema.type";

async function fetchCashiers(): Promise<Cashier[]> {
  const { data } = await apiClient.get("/api/cashier/all");
  return Array.isArray(data) ? data : [];
}

async function createCashierFn(data: CreateCashierType): Promise<Cashier> {
  const { data: response } = await apiClient.post("/api/cashier/register", data);
  return response;
}

async function editCashierFn({
  id,
  data,
}: {
  id: string;
  data: EditCashierType;
}): Promise<Cashier> {
  const { data: response } = await apiClient.patch(`/api/cashier/${id}`, data);
  return response;
}

async function deleteCashierFn(id: string): Promise<void> {
  await apiClient.delete(`/api/cashier/${id}`);
}

export function useCashiers() {
  return useQuery({
    queryKey: ["cashiers"],
    queryFn: fetchCashiers,
  });
}

export function useCreateCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashierFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCashierFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCashierFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
      toast.success("Cashier deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
