import React from "react";
import EmployeeDetailClient from "@/components/Employees/EmployeeDetailClient";

const EmployeeDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <EmployeeDetailClient id={id} initialEmployee={null} />;
};

export default EmployeeDetailPage;
