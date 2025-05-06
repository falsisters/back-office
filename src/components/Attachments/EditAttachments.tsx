"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { editAttachment } from "@/lib/server/editAttachment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Attachment } from "../../../utils/types/schema.type";

interface EditAttachmentProps {
  attachment: Attachment;
  isOpen: boolean;
  onClose: () => void;
  onAttachmentUpdated: (updatedAttachment: Attachment) => void;
}

export function EditAttachment({
  attachment,
  isOpen,
  onClose,
  onAttachmentUpdated,
}: EditAttachmentProps) {
  const [name, setName] = useState(attachment.name);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      // Pass only the name to the editAttachment function
      const updatedAttachment = await editAttachment(attachment.id, name);
      onAttachmentUpdated(updatedAttachment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] shadow-xl border-t-4 border-t-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Edit Attachment
          </DialogTitle>
          <DialogDescription>Update attachment name</DialogDescription>
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
              minLength={2}
              required
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}