"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { CreateEmployeeType } from "../../utils/types/Employee/addEmployee.type";
import type { EditEmployeeType } from "../../utils/types/Employee/editEmployee.type";
import type {
  EmployeeFilter,
} from "../../utils/types/Employee/filter.type";
import type {
  GetAllEmployeesResponse,
  EmployeeWithShiftsResponse,
} from "../../utils/types/Employee/getEmployee.type";
import type { EmployeeAttendanceResponse } from "../../utils/types/Employee/getEmployeeAttendance.type";
import type { UseQueryOptions } from "@tanstack/react-query";

async function fetchEmployees(
  filters?: EmployeeFilter
): Promise<GetAllEmployeesResponse> {
  const params = new URLSearchParams();
  if (filters?.branch) params.append("branch", filters.branch);
  const { data } = await apiClient.get(`/api/employee/user?${params}`);
  return Array.isArray(data) ? data : [];
}

async function fetchEmployee(
  id: string
): Promise<EmployeeWithShiftsResponse | null> {
  const { data } = await apiClient.get(`/api/employee/${id}`);
  return data;
}

async function fetchEmployeeAttendance(): Promise<EmployeeAttendanceResponse> {
  const { data } = await apiClient.get("/api/employee/attendance");
  return data;
}

async function createEmployeeFn(
  data: CreateEmployeeType
): Promise<EmployeeWithShiftsResponse> {
  const { data: response } = await apiClient.post("/api/employee/create", data);
  return response;
}

async function editEmployeeFn({
  id,
  data,
}: {
  id: string;
  data: EditEmployeeType;
}): Promise<EmployeeWithShiftsResponse> {
  const { data: response } = await apiClient.patch(
    `/api/employee/${id}`,
    data
  );
  return response;
}

async function deleteEmployeeFn(id: string): Promise<void> {
  await apiClient.delete(`/api/employee/${id}`);
}

export function useEmployees(filters?: EmployeeFilter) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => fetchEmployees(filters),
  });
}

export function useEmployee(
  id: string,
  options?: Omit<
    UseQueryOptions<EmployeeWithShiftsResponse | null>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => fetchEmployee(id),
    enabled: !!id,
    ...options,
  });
}

export function useEmployeeAttendance() {
  return useQuery({
    queryKey: ["employees", "attendance"],
    queryFn: fetchEmployeeAttendance,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployeeFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editEmployeeFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployeeFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
