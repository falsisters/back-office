import React from "react";
import { getAllEmployees } from "@/lib/server/Employee/getEmployee";
import EmployeesList from "@/components/Employees/EmployeesList";
import AddEmployeeDialog from "@/components/Employees/AddEmployeeDialog";

const EmployeesPage = async () => {
  const employees = await getAllEmployees();

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
      <EmployeesList employees={employees} />
    </div>
  );
};

export default EmployeesPage;
