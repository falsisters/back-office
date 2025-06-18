"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createCashier } from "@/lib/server/Cashier/createCashier";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import type { CashierPermissions } from "../../../utils/types/schema.type";
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/Cashier/getAllCashiersByUserId.type";

const permissionTypes: CashierPermissions[] = [
  "SALES",
  "DELIVERIES",
  "STOCKS",
  "EDIT_PRICE",
  "KAHON",
  "BILLS",
  "ATTACHMENTS",
  "SALES_HISTORY",
];

export function CreateCashier({
  onCashierCreated,
}: {
  onCashierCreated: (newCashier: GetAllCashiersByUserIdPayload[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [permissions, setPermissions] = useState<CashierPermissions[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      const formattedCashier = await createCashier({
        name,
        accessKey,
        permissions,
      });

      onCashierCreated(formattedCashier);
      resetForm();
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Cashier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] shadow-xl border-t-4 border-t-secondary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Create New Cashier
          </DialogTitle>
          <DialogDescription>
            Add a new cashier with custom permissions
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={4}
              required
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessKey" className="text-sm font-medium">
              Access Key
            </Label>
            <Input
              id="accessKey"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              maxLength={4}
              required
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissions</Label>
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-md">
              {permissionTypes.map((perm) => (
                <div key={perm} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm}
                    checked={permissions.includes(perm)}
                    onCheckedChange={(checked) => {
                      setPermissions((prev) =>
                        checked
                          ? [...prev, perm]
                          : prev.filter((p) => p !== perm)
                      );
                    }}
                    className="text-secondary border-gray-400 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <Label htmlFor={perm} className="capitalize text-sm">
                    {perm.toLowerCase().replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary/90 text-white"
          >
            {isLoading ? "Creating..." : "Create Cashier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
