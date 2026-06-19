"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateEmployeeSchema,
  CreateEmployeeType,
} from "../../../utils/types/Employee/addEmployee.type";
import { EmployeeWithShiftsResponse } from "../../../utils/types/Employee/getEmployee.type";
import { useCreateEmployee, useEditEmployee } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateNewEmployeeProps {
  initialData?: EmployeeWithShiftsResponse;
  onSuccess?: () => void;
}

const CreateNewEmployee = ({
  initialData,
  onSuccess,
}: CreateNewEmployeeProps) => {
  const createMutation = useCreateEmployee();
  const editMutation = useEditEmployee();
  const isEditing = !!initialData;

  const isPending = isEditing ? editMutation.isPending : createMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<CreateEmployeeType>({
    resolver: zodResolver(CreateEmployeeSchema),
    defaultValues: {
      name: initialData?.name || "",
      branch: initialData?.branch || "",
    },
    mode: "onChange",
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("branch", initialData.branch || "");
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  const onSubmit = (data: CreateEmployeeType) => {
    if (isPending) return;

    if (isEditing && initialData) {
      editMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            reset();
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to update employee"
            );
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to create employee"
          );
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Employee Name</Label>
        <Input
          id="name"
          placeholder="Enter employee name"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">Branch (Optional)</Label>
        <Input
          id="branch"
          placeholder="Enter branch name"
          {...register("branch")}
          className={errors.branch ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.branch && (
          <p className="text-sm text-destructive">{errors.branch.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isPending || !isValid}
          className="w-full"
        >
          {isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Employee"
            : "Create Employee"}
        </Button>
      </div>
    </form>
  );
};

export default CreateNewEmployee;
