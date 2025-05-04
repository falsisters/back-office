"use client"

import { Button } from "@/components/ui/button"
import { Download, X, Pencil } from "lucide-react"
import type { Attachment } from "../../../utils/types/schema.type"
import { EditAttachment } from "./EditAttachments"
import { useState } from "react"
import Image from "next/image"

interface AttachmentDetailsProps {
  attachment: Attachment
  onClose: () => void
  onUpdate: (updatedAttachment: Attachment) => void
}

export function AttachmentDetails({ attachment, onClose, onUpdate }: AttachmentDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isImage = attachment.url.match(/\.(jpeg|jpg|gif|png)$/)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">Type: {attachment.type}</p>
          <p className="text-sm text-muted-foreground">
            Uploaded: {new Date(attachment.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isImage ? (
        <div className="flex justify-center">
          <Image
            src={attachment.url} 
            alt={attachment.name}
            className="max-h-[60vh] max-w-full object-contain rounded-md"
            width={500}
            height={500}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-md">
          <p className="text-muted-foreground mb-4">Preview not available</p>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download to view
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          variant="outline" 
          onClick={() => setIsEditDialogOpen(true)}
          className="text-primary"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <EditAttachment
        attachment={attachment}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onAttachmentUpdated={onUpdate}
      />
    </div>
  )
}