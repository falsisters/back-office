"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => Promise<void>
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-t-4 border-t-red-500 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600 text-xl">
            Are you sure you want to delete this cashier?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            This action cannot be undone. This will permanently delete the cashier and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white transition-colors"
            onClick={async () => {
              console.log("[Dialog] Delete confirmed")
              try {
                await onConfirmDelete()
              } catch (error) {
                console.error("[Dialog] Delete error:", error)
              }
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

