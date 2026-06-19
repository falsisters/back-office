"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { ProductResponse } from "../../utils/types/Products/getAllProductsByUserId.type";

async function fetchProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get("/api/product/user");
  return Array.isArray(data) ? data : [];
}

async function fetchProduct(id: string): Promise<ProductResponse> {
  const { data } = await apiClient.get(`/api/product/${id}`);
  return data;
}

async function fetchProductsByCashier(
  cashierId: string
): Promise<ProductResponse[]> {
  const { data } = await apiClient.get(`/api/product/cashier/${cashierId}`);
  return Array.isArray(data) ? data : [];
}

async function fetchUnassignedProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get("/api/product/user/unassigned");
  return Array.isArray(data) ? data : [];
}

async function createProductForCashierFn({
  cashierId,
  formData,
}: {
  cashierId: string;
  formData: FormData;
}): Promise<ProductResponse> {
  const { data } = await apiClient.post(
    `/api/product/user/create/${cashierId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

async function editProductFn({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}): Promise<ProductResponse> {
  const { data } = await apiClient.patch(
    `/api/product/user/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

async function deleteProductFn(id: string): Promise<void> {
  await apiClient.delete(`/api/product/user/${id}`);
}

async function assignCashierToProductFn({
  productId,
  cashierId,
}: {
  productId: string;
  cashierId: string;
}): Promise<void> {
  await apiClient.patch(
    `/api/product/user/${productId}/assign-cashier/${cashierId}`
  );
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useProductsByCashier(cashierId: string | null) {
  return useQuery({
    queryKey: ["products", "cashier", cashierId],
    queryFn: () => fetchProductsByCashier(cashierId!),
    enabled: !!cashierId,
  });
}

export function useUnassignedProducts() {
  return useQuery({
    queryKey: ["products", "unassigned"],
    queryFn: fetchUnassignedProducts,
  });
}

export function useCreateProductForCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductForCashierFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editProductFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useAssignCashierToProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignCashierToProductFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "unassigned"] });
      toast.success("Cashier assigned successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
