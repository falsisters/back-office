"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { editAttachment } from "@/lib/server/editAttachment"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Attachment, AttachmentType } from "../../../utils/types/schema.type"

interface EditAttachmentProps {
  attachment: Attachment
  isOpen: boolean
  onClose: () => void
  onAttachmentUpdated: (updatedAttachment: Attachment) => void
}

export function EditAttachment({
  attachment,
  isOpen,
  onClose,
  onAttachmentUpdated,
}: EditAttachmentProps) {
  const [name, setName] = useState(attachment.name)
  const [type, setType] = useState<AttachmentType>(attachment.type)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setIsLoading(true)
      const updatedAttachment = await editAttachment(attachment.id, { name, type })
      onAttachmentUpdated(updatedAttachment)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] shadow-xl border-t-4 border-t-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Edit Attachment</DialogTitle>
          <DialogDescription>Update attachment details</DialogDescription>
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

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type
            </Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as AttachmentType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="EXPENSE_RECEIPT">Expense Receipt</option>
              <option value="CHECKS_AND_BANK_TRANSFER">Checks & Bank Transfers</option>
              <option value="INVENTORIES">Inventories</option>
              <option value="SUPPORTING_DOCUMENTS">Supporting Documents</option>
            </select>
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
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}