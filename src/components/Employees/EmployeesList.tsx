"use client";

import React, { useState, useMemo } from "react";
import { GetAllEmployeesResponse } from "../../../utils/types/Employee/getEmployee.type";
import EmployeeCard from "./EmployeeCard";
import BranchFolder from "./BranchFolder";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen } from "lucide-react";

interface EmployeesListProps {
  employees: GetAllEmployeesResponse;
}

const EmployeesList = ({ employees }: EmployeesListProps) => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // Group employees by branch
  const employeesByBranch = useMemo(() => {
    const grouped = new Map<string, GetAllEmployeesResponse>();
    
    employees.forEach((employee) => {
      const branch = employee.branch || "Unassigned";
      if (!grouped.has(branch)) {
        grouped.set(branch, []);
      }
      grouped.get(branch)?.push(employee);
    });
    
    return grouped;
  }, [employees]);

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

  // Show folder view when no branch is selected
  if (selectedBranch === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <FolderOpen className="h-5 w-5" />
          <p className="text-sm">Select a branch to view employees</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from(employeesByBranch.entries())
            .sort(([branchA], [branchB]) => {
              // Sort "Unassigned" to the end
              if (branchA === "Unassigned") return 1;
              if (branchB === "Unassigned") return -1;
              return branchA.localeCompare(branchB);
            })
            .map(([branch, branchEmployees]) => (
              <BranchFolder
                key={branch}
                branchName={branch}
                employeeCount={branchEmployees.length}
                onClick={() => setSelectedBranch(branch)}
              />
            ))}
        </div>
      </div>
    );
  }

  // Show employees for selected branch
  const branchEmployees = employeesByBranch.get(selectedBranch) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setSelectedBranch(null)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Branches
        </Button>
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{selectedBranch}</h2>
          <span className="text-sm text-muted-foreground">
            ({branchEmployees.length} {branchEmployees.length === 1 ? 'employee' : 'employees'})
          </span>
        </div>
        <div className="w-32" /> {/* Spacer for alignment */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branchEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default EmployeesList;
