"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { editBillCount } from "@/lib/server/editBillCount"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  billCountId: string
  billType: string | null
  onSuccess: () => Promise<void>
}

export function DeleteConfirmDialog({ isOpen, onClose, billCountId, billType, onSuccess }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!billType) return

    setIsDeleting(true)
    try {
      // We're not actually deleting the bill, just setting its amount to 0
      await editBillCount(billCountId, {
        bills: [{ amount: 0, type: billType as keyof typeof getBillTypeLabel }],
      })
      await onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to delete bill:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getBillTypeLabel = (type: string | null) => {
    if (!type) return ""

    switch (type) {
      case "THOUSAND":
        return "₱1,000"
      case "FIVE_HUNDRED":
        return "₱500"
      case "HUNDRED":
        return "₱100"
      case "FIFTY":
        return "₱50"
      case "TWENTY":
        return "₱20"
      case "COINS":
        return "Coins"
      default:
        return type
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {getBillTypeLabel(billType)} from this bill count? This action will set the
            amount to zero.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
