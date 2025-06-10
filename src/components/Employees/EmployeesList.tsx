import React from "react";
import { GetAllEmployeesResponse } from "../../../utils/types/getEmployee.type";
import EmployeeCard from "./EmployeeCard";

interface EmployeesListProps {
  employees: GetAllEmployeesResponse;
}

const EmployeesList = ({ employees }: EmployeesListProps) => {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">
          No employees found
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by adding your first employee
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeesList;
