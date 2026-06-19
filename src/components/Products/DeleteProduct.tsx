"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteProductProps {
  productId: string;
  productName: string;
  onProductDeleted: () => void;
}

export default function DeleteProduct({
  productId,
  productName,
  onProductDeleted,
}: DeleteProductProps) {
  const deleteMutation = useDeleteProduct();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(productId);
      onProductDeleted();
      toast.success(`${productName} has been removed`);
      setIsOpen(false);
    } catch (_error) {
      // Error toast handled by mutation's onError
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-t-4 border-t-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            product
            <span className="font-medium"> {productName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 my-2">
          <p className="text-sm text-destructive font-medium">
            Are you sure you want to delete this product?
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteMutation.isPending}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            {deleteMutation.isPending ? (
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
  );
}
