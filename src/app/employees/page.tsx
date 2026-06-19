"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeesList from "@/components/Employees/EmployeesList";
import AddEmployeeDialog from "@/components/Employees/AddEmployeeDialog";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

const EmployeesPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/login");
    return null;
  }

  return <EmployeesPageContent />;
};

function EmployeesPageContent() {
  const { data: employees, isLoading } = useEmployees();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        <AddEmployeeDialog />
      </div>
      <EmployeesList employees={employees || []} />
    </div>
  );
};

export default EmployeesPage;
