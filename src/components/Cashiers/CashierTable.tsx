// components/CashierTable.tsx
"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, Pencil, Trash2 } from "lucide-react";
import type { Cashier } from "../../../utils/types/schema.type";
import { EditCashier } from "./EditCashier";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface CashierTableRowProps {
  cashier: Cashier;
  onDeleteCashier: (id: string) => Promise<void>;
  onUpdateCashier: (updatedCashier: Cashier) => void;
}

export function CashierTableRow({
  cashier,
  onDeleteCashier,
  onUpdateCashier,
}: CashierTableRowProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    try {
      setIsDeleting(true);
      await onDeleteCashier(cashier.id);
    } catch (error) {
      console.error("[CashierTable] Delete error:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            {cashier.name}
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-1">
            {cashier.permissions.map((permission) => (
              <Badge
                key={permission}
                variant="outline"
                className="capitalize"
              >
                {permission}
              </Badge>
            ))}
          </div>
        </TableCell>

        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <EditCashier
        cashier={cashier}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onCashierUpdated={onUpdateCashier}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteClick}
        isDeleting={isDeleting}
      />
    </>
  );
}