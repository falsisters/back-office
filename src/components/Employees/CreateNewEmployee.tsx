"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateEmployeeSchema,
  CreateEmployeeType,
} from "../../../utils/types/Employee/addEmployee.type";
import { EmployeeWithShiftsResponse } from "../../../utils/types/Employee/getEmployee.type";
import { createEmployee } from "@/lib/server/Employee/addEmployee";
import { editEmployee } from "@/lib/server/Employee/editEmployee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreateNewEmployeeProps {
  initialData?: EmployeeWithShiftsResponse;
  onSuccess?: () => void;
}

const CreateNewEmployee = ({
  initialData,
  onSuccess,
}: CreateNewEmployeeProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditing = !!initialData;

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

  const onSubmit = async (data: CreateEmployeeType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        await editEmployee(initialData.id, data);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee(data);
        toast.success("Employee created successfully");
        reset();
      }

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Employee operation error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} employee`
      );
    } finally {
      setIsSubmitting(false);
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        {errors.branch && (
          <p className="text-sm text-destructive">{errors.branch.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full"
        >
          {isSubmitting
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
