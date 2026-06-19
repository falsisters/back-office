"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { DateRangeQueryType } from "../../utils/types/kahon.type";

function buildDateParams(params?: DateRangeQueryType): string {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ─── Queries ───────────────────────────────────────────────

export function useKahonSheets(params?: DateRangeQueryType) {
  return useQuery({
    queryKey: ["kahon", "sheets", params],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/sheet/user/date${buildDateParams(params)}`
      );
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useSheet(sheetId: string) {
  return useQuery({
    queryKey: ["kahon", "sheet", sheetId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/sheet/user/${sheetId}`);
      return data;
    },
    enabled: !!sheetId,
  });
}

export function useSheetByCashier(cashierId: string) {
  return useQuery({
    queryKey: ["kahon", "sheet", "cashier", cashierId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/sheet/user/cashier/${cashierId}`
      );
      return data;
    },
    enabled: !!cashierId,
  });
}

export function useInventorySheets(params?: DateRangeQueryType) {
  return useQuery({
    queryKey: ["kahon", "inventory", params],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/inventory/user/date${buildDateParams(params)}`
      );
      return Array.isArray(data) ? data : [];
    },
  });
}

// ─── Kahon Row Mutations ────────────────────────────────────

export function useCreateKahonRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { sheetId: string; rowIndex: number; description?: string }) =>
      apiClient.post("/api/sheet/user/calculation-row", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

export function useBatchCreateKahonRows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { sheetId: string; rowIndexes: number[] }) =>
      apiClient.post("/api/sheet/user/calculation-rows", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

export function useDeleteKahonRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowId: string) =>
      apiClient.delete(`/api/sheet/user/row/${rowId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

// ─── Kahon Cell Mutations ───────────────────────────────────

export function useCreateCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rowId: string; columnIndex: number; value: string; color?: string; formula?: string; rowIndex?: number }) =>
      apiClient.post("/api/sheet/user/cell", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

export function useUpdateCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cellId, data }: { cellId: string; data: { value: string; formula?: string | null; color?: string | null; rowIndex?: number } }) =>
      apiClient.patch(`/api/sheet/user/cell/${cellId}`, {
        value: data.value || "",
        formula: data.formula === undefined ? null : data.formula,
        color: data.color === undefined ? null : data.color,
        rowIndex: data.rowIndex,
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

export function useDeleteCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cellId: string) =>
      apiClient.delete(`/api/sheet/user/cell/${cellId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useBatchUpdateCells() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changes: any[]) =>
      apiClient.patch("/api/sheet/user/cells/batch", {
        changes: changes.map((c) => ({
          ...c,
          formula: c.formula === undefined ? null : c.formula,
          color: c.color === undefined ? null : c.color,
        })),
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useBatchCreateCells() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cells: any[]) =>
      apiClient.post("/api/sheet/user/cells", { cells }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

// ─── Inventory Row Mutations ────────────────────────────────

export function useCreateInventoryRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { inventoryId?: string; sheetId?: string; rowIndex: number; description?: string }) =>
      apiClient.post("/api/inventory/user/calculation-row", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

export function useDeleteInventoryRow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowId: string) =>
      apiClient.delete(`/api/inventory/user/row/${rowId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

// ─── Inventory Cell Mutations ───────────────────────────────

export function useUpdateInventoryCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cellId, data }: { cellId: string; data: { value: string; formula?: string | null; color?: string | null; rowIndex?: number } }) =>
      apiClient.patch(`/api/inventory/user/cell/${cellId}`, {
        value: data.value || "",
        formula: data.formula === undefined ? null : data.formula,
        color: data.color === undefined ? null : data.color,
        rowIndex: data.rowIndex,
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

export function useBatchUpdateInventoryCells() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (changes: any[]) =>
      apiClient.patch("/api/inventory/user/cells/batch", {
        changes: changes.map((c) => ({
          ...c,
          formula: c.formula === undefined ? null : c.formula,
          color: c.color === undefined ? null : c.color,
        })),
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useBatchCreateInventoryCells() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cells: any[]) =>
      apiClient.post("/api/inventory/user/cells", { cells }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
  });
}

// ─── Reorder Mutations ──────────────────────────────────────

export function useReorderKahonRows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Array<{ rowId: string; newRowIndex: number }>) =>
      apiClient.patch("/api/sheet/user/rows/positions", { updates }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useReorderInventoryRows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Array<{ rowId: string; newRowIndex: number }>) =>
      apiClient.patch("/api/inventory/user/rows/positions", { updates }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kahon"] }),
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
