"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createCashier } from "@/lib/server/createCashier";
import type { CreateCashierFormData } from "../../../utils/types/createCashier.type";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CashierPermissionType } from "../../../utils/types/schema.type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

const permissionTypes: CashierPermissionType[] = [
  "PRICES",
  "DELIVERIES",
  "STOCKS",
  "PROFITS",
  "KAHON",
  "SALES_CHECK",
  "SALES_HISTORY",
];

export function CreateCashier() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [permissions, setPermissions] = useState<CashierPermissionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setError(null);

    if (name.length < 4) {
      setError("Name must be 4 or more characters");
      return;
    }

    setIsLoading(true);
    const formData: CreateCashierFormData = {
      name,
      accessKey,
      permissions: permissions.map((perm) => ({ name: perm })),
    };

    try {
      await createCashier(formData);
      setName("");
      setAccessKey("");
      setPermissions([]);
      setHasAttemptedSubmit(false);
      alert("Cashier created successfully");
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAccessKey("");
    setPermissions([]);
    setError(null);
    setHasAttemptedSubmit(false);
  };

  return (
    <div className="w-full max-w-2xl p-4 md:p-0">
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <PlusCircle />
            Create New Cashier
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Cashier</DialogTitle>
            <DialogDescription>
              Add a new cashier with custom permissions
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (hasAttemptedSubmit && e.target.value.length >= 4) {
                    setError(null);
                  }
                }}
                required
                disabled={isLoading}
              />
              {hasAttemptedSubmit && name.length < 4 && (
                <p className="text-sm text-red-500">
                  Name must be 4 or more characters
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissionTypes.map((perm) => (
                  <div key={perm} className="flex items-center space-x-2">
                    <Checkbox
                      id={perm}
                      checked={permissions.includes(perm)}
                      onCheckedChange={(checked) => {
                        setPermissions(
                          checked
                            ? [...permissions, perm]
                            : permissions.filter((p) => p !== perm)
                        );
                      }}
                      disabled={isLoading}
                    />
                    <Label htmlFor={perm}>{perm}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Cashier"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
