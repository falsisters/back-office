import React from "react";
import { getEmployeeById } from "@/lib/server/Employee/getEmployee";
import EmployeeDetailClient from "@/components/Employees/EmployeeDetailClient";
import { notFound } from "next/navigation";
import { EmployeeWithShiftsResponse } from "../../../../utils/types/Employee/getEmployee.type";

const EmployeeDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  let initialEmployee: EmployeeWithShiftsResponse | null = null;
  try {
    initialEmployee = await getEmployeeById(id);
  } catch {
    // Fall through to client-side fetch
  }

  if (initialEmployee === undefined) {
    notFound();
  }

  return <EmployeeDetailClient id={id} initialEmployee={initialEmployee} />;
};

export default EmployeeDetailPage;
