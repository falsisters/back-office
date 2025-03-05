"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCashierById } from "@/lib/server/getCashierById";
import { editCashier } from "@/lib/server/editCashier";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import type { CashierPermissionType } from "../../../utils/types/schema.type";
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/getAllCashiersByUserId.type";
import { Alert, AlertDescription } from "@/components/ui/alert";

const permissionTypes: CashierPermissionType[] = [
  "PRICES",
  "DELIVERIES",
  "STOCKS",
  "PROFITS",
  "KAHON",
  "SALES_CHECK",
  "SALES_HISTORY",
];

interface EditCashierDialogProps {
  cashierId: string;
  isOpen: boolean;
  onClose: () => void;
  onCashierUpdated: (
    updatedCashier: GetAllCashiersByUserIdPayload[number]
  ) => void;
}

export function EditCashier({
  cashierId,
  isOpen,
  onClose,
  onCashierUpdated,
}: EditCashierDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [name, setName] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [permissions, setPermissions] = useState<CashierPermissionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [originalCashier, setOriginalCashier] = useState<
    GetAllCashiersByUserIdPayload[number] | null
  >(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && cashierId) {
      const fetchCashierData = async () => {
        try {
          setIsFetching(true);
          setError(null);
          console.log(`Fetching cashier data for ID: ${cashierId}`);

          const cashierData = await getCashierById(cashierId);
          console.log("Received cashier data:", cashierData);

          setOriginalCashier(cashierData);
          setName(cashierData.name || "");
          setAccessKey(cashierData.accessKey || "");
          setPermissions(
            cashierData.permissions?.map(
              (p) => p.name as CashierPermissionType
            ) || []
          );
        } catch (error) {
          console.error("Error fetching cashier data:", error);
          setError("Failed to fetch cashier data. Please try again.");
          toast({
            title: "Error",
            description: "Failed to fetch cashier data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsFetching(false);
        }
      };

      fetchCashierData();
    }
  }, [isOpen, cashierId, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.length < 4) {
      setError("Name must be 4 or more characters");
      return;
    }

    if (accessKey && accessKey.length !== 4) {
      setError("Access key must be exactly 4 characters");
      return;
    }

    setIsLoading(true);

    const formData = {
      id: cashierId,
      name,
      accessKey,
      permissions: permissions.map((perm) => ({ name: perm })),
    };

    console.log("Submitting form data:", formData);

    try {
      await editCashier(formData);

      const formattedCashier = {
        id: cashierId,
        name: name,
        accessKey: accessKey,
        secureCode: originalCashier?.secureCode || "",
        userId: originalCashier?.userId || "",
        createdAt: originalCashier?.createdAt || new Date(),
        updatedAt: new Date(),
        permissions: permissions.map((perm) => ({
          id:
            originalCashier?.permissions?.find((p) => p.name === perm)?.id ||
            `temp-${perm}`,
          name: perm,
          createdAt:
            originalCashier?.permissions?.find((p) => p.name === perm)
              ?.createdAt || new Date(),
          updatedAt: new Date(),
          cashierId: cashierId,
        })),
      } as GetAllCashiersByUserIdPayload[number];

      onCashierUpdated(formattedCashier);

      toast({
        title: "Cashier updated",
        description: "Cashier has been successfully updated.",
      });

      onClose();
    } catch (error) {
      console.error("Error updating cashier:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update cashier"
      );
      toast({
        title: "Error",
        description: "Failed to update cashier. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Cashier</DialogTitle>
          <DialogDescription>
            Update the cashier&apos;s information. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="py-4 text-center">Loading cashier data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                minLength={4}
              />
              <p className="text-sm text-gray-500">
                Enter the cashier&apos;s full name (minimum 4 characters).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <Input
                id="accessKey"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="****"
                maxLength={4}
              />
              <p className="text-sm text-gray-500">
                Update the cashier&apos;s access key (exactly 4 characters).
              </p>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissionTypes.map((perm) => (
                  <div key={perm} className="flex items-center space-x-2">
                    <Checkbox
                      id={`perm-${perm}`}
                      checked={permissions.includes(perm)}
                      onCheckedChange={(checked) => {
                        setPermissions(
                          checked
                            ? [...permissions, perm]
                            : permissions.filter((p) => p !== perm)
                        );
                      }}
                    />
                    <Label htmlFor={`perm-${perm}`}>{perm}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
