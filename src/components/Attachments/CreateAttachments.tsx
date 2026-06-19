"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateAttachment } from "@/hooks/useAttachments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import type { AttachmentType } from "../../../utils/types/schema.type";
import {
  validateAttachmentFile,
  getFileTypeCategory,
  formatFileSize,
} from "@/lib/utils/fileValidation";

export function CreateAttachment() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AttachmentType>("EXPENSE_RECEIPT");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const createMutation = useCreateAttachment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);

    if (!file) {
      setFileError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("file", file);

    createMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
        setOpen(false);
      },
      onError: () => {
        // Error toast handled by hook
      },
    });
  };

  const resetForm = () => {
    setName("");
    setType("EXPENSE_RECEIPT");
    setFile(null);
    setFileError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const validation = validateAttachmentFile(file);

      if (!validation.isValid) {
        setFileError(validation.error || "Invalid file");
        e.target.value = "";
        return;
      }

      if (validation.fileInfo) {
        const category = getFileTypeCategory(file.type);
        console.log(
          `File selected: ${
            validation.fileInfo.name
          } (${category}, ${formatFileSize(validation.fileInfo.size)})`
        );
      }

      setFile(file);
      setFileError(null);
    } else {
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload New Attachment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] shadow-xl border-t-4 border-t-secondary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Upload New Attachment
          </DialogTitle>
          <DialogDescription>
            Add a new file to your attachments
          </DialogDescription>
        </DialogHeader>

        {fileError && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
            {fileError}
          </div>
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
              <option value="CHECKS_AND_BANK_TRANSFER">
                Checks & Bank Transfers
              </option>
              <option value="INVENTORIES">Inventories</option>
              <option value="SUPPORTING_DOCUMENTS">Supporting Documents</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">
              File
            </Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    {file
                      ? `${file.name} (${formatFileSize(file.size)})`
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Images: JPEG, PNG, WebP, HEIC, TIFF, AVIF, BMP, GIF, SVG
                  </p>
                  <p className="text-xs text-gray-500">
                    Documents: PDF, TXT, DOCX, XLSX, DOC, XLS (MAX. 15MB)
                  </p>
                </div>
                <input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,.avif,.heic,.heif,.bmp,.gif,.svg,.pdf,.txt,.docx,.xlsx,.doc,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-secondary hover:bg-secondary/90 text-white"
          >
            {createMutation.isPending ? "Uploading..." : "Upload Attachment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
