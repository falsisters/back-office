"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../utils/types/error.type";
import {
  GetAllEmployeesResponse,
  EmployeeWithShiftsResponse,
} from "../../../utils/types/getEmployee.type";

export const getAllEmployees = async (): Promise<GetAllEmployeesResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/employee/user`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }

    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to fetch employees");
  }

  const payload: GetAllEmployeesResponse = await response.json();
  return payload;
};

export const getEmployeeById = async (
  id: string
): Promise<EmployeeWithShiftsResponse | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const response = await fetch(`${process.env.API_URL}/employee/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    const error: NestApiError = await response.json();
    throw new Error(error.message?.toString() || "Failed to fetch employee");
  }

  const payload: EmployeeWithShiftsResponse = await response.json();
  return payload;
};
