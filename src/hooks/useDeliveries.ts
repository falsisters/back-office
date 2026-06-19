"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { CreateDeliveryDto } from "../../utils/types/Deliveries/createDelivery.type";
import type { EditDeliveryDto } from "../../utils/types/Deliveries/editDelivery.type";
import type { GetAllDeliveriesByCashierIdPayload } from "../../utils/types/Deliveries/getAllDeliveriesByCashierId.type";
import type { GetAllDeliveriesByUserIdPayload } from "../../utils/types/Deliveries/getAllDeliveriesByUserId.type";
import type { GetDeliveryByIdPayload } from "../../utils/types/Deliveries/getDeliveryById.type";

async function fetchDeliveries(): Promise<GetAllDeliveriesByUserIdPayload> {
  const { data } = await apiClient.get("/api/delivery/user");
  return Array.isArray(data) ? data : [];
}

async function fetchDeliveriesByCashier(
  cashierId: string
): Promise<GetAllDeliveriesByCashierIdPayload> {
  const { data } = await apiClient.get(`/api/delivery/cashier/${cashierId}`);
  return Array.isArray(data) ? data : [];
}

async function fetchDelivery(id: string): Promise<GetDeliveryByIdPayload> {
  const { data } = await apiClient.get(`/api/delivery/${id}`);
  return data;
}

async function createDeliveryFn(
  dto: CreateDeliveryDto
): Promise<GetDeliveryByIdPayload> {
  const { data } = await apiClient.post("/api/delivery/create", dto);
  return data;
}

async function editDeliveryFn({
  id,
  data,
}: {
  id: string;
  data: EditDeliveryDto;
}): Promise<GetDeliveryByIdPayload> {
  const { data: response } = await apiClient.patch(`/api/delivery/${id}`, data);
  return response;
}

async function deleteDeliveryFn(id: string): Promise<void> {
  await apiClient.delete(`/api/delivery/${id}`);
}

export function useDeliveries() {
  return useQuery({
    queryKey: ["deliveries"],
    queryFn: fetchDeliveries,
  });
}

export function useDeliveriesByCashier(cashierId: string) {
  return useQuery({
    queryKey: ["deliveries", "cashier", cashierId],
    queryFn: () => fetchDeliveriesByCashier(cashierId),
    enabled: !!cashierId,
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: ["deliveries", id],
    queryFn: () => fetchDelivery(id),
    enabled: !!id,
  });
}

export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeliveryFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery created successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editDeliveryFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery updated successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeliveryFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
