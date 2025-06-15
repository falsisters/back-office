"use server";

import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import {
  EmployeeAttendanceFilter,
  EmployeeAttendanceResponse,
} from "../../../../utils/types/Employee/getEmployeeAttendance.type";

export const getEmployeeAttendance = async (
  params?: EmployeeAttendanceFilter
): Promise<EmployeeAttendanceResponse> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) throw new Error("Unauthorized");

  const url = new URL(`${process.env.API_URL}/employee/attendance`);

  if (params?.startDate) {
    url.searchParams.append("startDate", params.startDate);
  }

  if (params?.endDate) {
    url.searchParams.append("endDate", params.endDate);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Employee attendance not found");
    }

    const error: NestApiError = await response.json();
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to fetch employee attendance"
    );
  }

  const payload: EmployeeAttendanceResponse = await response.json();
  return payload;
};
