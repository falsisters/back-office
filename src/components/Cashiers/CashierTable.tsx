"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCircle, Pencil, Trash2 } from "lucide-react"
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/getAllCashiersByUserId.type"
import { EditCashier } from "./EditCashier"
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"

interface CashierTableRowProps {
  cashier: GetAllCashiersByUserIdPayload[number]
  onDeleteCashier: (id: string) => Promise<void>
}

export function CashierTable({ cashier, onDeleteCashier }: CashierTableRowProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDeleteClick = async () => {
    setIsDeleteDialogOpen(false)
    await onDeleteCashier(cashier.id)
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            {cashier.name}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {cashier.permissions.map((permission) => (
              <Badge key={permission.id} variant="outline">
                {permission.name}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <EditCashier cashierId={cashier.id} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteClick}
      />
    </>
  )
}

