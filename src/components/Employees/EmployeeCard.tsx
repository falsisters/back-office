"use client";

import React, { useState, useCallback } from "react";
import { EmployeeWithShiftsResponse } from "../../../utils/types/Employee/getEmployee.type";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { deleteEmployee } from "@/lib/server/Employee/deleteEmployee";
import { toast } from "sonner";
import CreateNewEmployee from "./CreateNewEmployee";

interface EmployeeCardProps {
  employee: EmployeeWithShiftsResponse;
}

const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const activeShifts = employee.ShiftEmployee.filter(
    (se) => se.shift.endTime === null
  ).length;

  const totalShifts = employee.ShiftEmployee.length;

  const handleViewDetails = useCallback(() => {
    setDropdownOpen(false);
    router.push(`/employees/${employee.id}`);
  }, [employee.id, router]);

  const handleEdit = useCallback(() => {
    setDropdownOpen(false);
    setIsEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setDropdownOpen(false);
    setIsDeleteOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setIsEditOpen(false);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEmployee(employee.id);
      toast.success("Employee deleted successfully");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete employee"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteOpen(false);
    }
  }, [isDeleting]);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">
                ID: {employee.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {new Date(employee.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge variant={activeShifts > 0 ? "default" : "secondary"}>
              <Clock className="mr-1 h-3 w-3" />
              {activeShifts} Active
            </Badge>
            <Badge variant="outline">{totalShifts} Total Shifts</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewDetails}
          >
            View Attendance
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <CreateNewEmployee
            initialData={employee}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              employee "{employee.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeCard;
