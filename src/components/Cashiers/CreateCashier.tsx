// components/CreateCashier.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createCashier } from "@/lib/server/createCashier";
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
import { GetAllCashiersByUserIdPayload } from "../../../utils/types/getAllCashiersByUserId.type";

const permissionTypes: CashierPermissions[] = [
  "SALES",
  "DELIVERIES",
  "STOCKS",
  "EDIT_PRICE",
  "KAHON",
  "PROFITS",
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
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
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessKey">Access Key</Label>
            <Input
              id="accessKey"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              maxLength={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
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
                  />
                  <Label htmlFor={perm} className="capitalize">
                    {perm.toLowerCase().replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Cashier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
