"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
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
  const [showSecureCode, setShowSecureCode] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopySecureCode = async () => {
    try {
      await navigator.clipboard.writeText(cashier.secureCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy secure code:", err);
    }
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">{cashier.name}</span>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {showSecureCode ? cashier.secureCode : "••••••••••••"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecureCode(!showSecureCode)}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              {showSecureCode ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySecureCode}
              className="h-6 w-6 p-0 hover:bg-gray-200"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-1.5">
            {cashier.permissions.map((permission) => (
              <Badge
                key={permission}
                variant="outline"
                className="capitalize bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
              >
                {permission.toLowerCase().replace(/_/g, " ")}
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
              className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
