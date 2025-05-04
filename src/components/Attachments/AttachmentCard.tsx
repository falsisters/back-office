"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, ImageIcon, FileTextIcon, Trash2, Eye, Pencil } from "lucide-react"
import type { Attachment } from "../../../utils/types/schema.type"
import { useToast } from "@/hooks/use-toast"
import { EditAttachment } from "./EditAttachments"
import { useState } from "react"
import Image from "next/image"

interface AttachmentCardProps {
  attachment: Attachment
  onDelete: (id: string) => Promise<void>
  onView: () => void
  onUpdate: (updatedAttachment: Attachment) => void
}

export function AttachmentCard({ attachment, onDelete, onView, onUpdate }: AttachmentCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const getFileIcon = () => {
    if (attachment.url.match(/\.(jpeg|jpg|gif|png)$/)) {
      return <ImageIcon className="h-5 w-5" />
    } else if (attachment.url.match(/\.(pdf)$/)) {
      return <FileTextIcon className="h-5 w-5" />
    }
    return <FileIcon className="h-5 w-5" />
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(attachment.id)
    } catch (error) {
      console.log("Error deleting attachment:", error)
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <span className="font-medium text-sm truncate">{attachment.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(attachment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {attachment.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
            <div 
              className="aspect-video bg-gray-100 rounded-md flex items-center justify-center cursor-pointer"
              onClick={onView}
            >
              <Image
                src={attachment.url} 
                alt={attachment.name}
                className="object-contain max-h-full max-w-full rounded-md"
                width={300}
                height={200}
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView}
            className="text-primary hover:text-primary/80"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditDialogOpen(true)}
              className="text-muted-foreground hover:text-muted-foreground/80"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <EditAttachment
        attachment={attachment}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onAttachmentUpdated={onUpdate}
      />
    </>
  )
}