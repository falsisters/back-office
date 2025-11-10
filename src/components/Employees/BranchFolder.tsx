"use client";

import React from "react";
import { Folder, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BranchFolderProps {
  branchName: string;
  employeeCount: number;
  onClick: () => void;
}

const BranchFolder = ({ branchName, employeeCount, onClick }: BranchFolderProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Folder className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-xl">{branchName}</h3>
              <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {employeeCount}
            </Badge>
            <ChevronRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchFolder;
