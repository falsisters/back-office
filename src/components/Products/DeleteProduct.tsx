"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/lib/server/deleteProduct"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"

interface DeleteProductProps {
  productId: string
  productName: string
  onProductDeleted: () => void
}

export default function DeleteProduct({ productId, productName, onProductDeleted }: DeleteProductProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // First perform the actual deletion
      await deleteProduct(productId)

      // Then update the UI
      onProductDeleted()

      toast({
        title: "Product deleted successfully",
        description: `${productName} has been removed`,
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Deletion failed",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1">
          <Trash2 size={14} />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the product
            <span className="font-medium"> {productName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 my-2">
          <p className="text-sm text-destructive font-medium">Are you sure you want to delete this product?</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Confirm Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

