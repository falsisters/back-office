import { z } from "zod";
import { AttachmentTypeEnum } from "../schema.type";

// Enhanced file validation for attachments
const AttachmentFileSchema = z
  .instanceof(File)
  .refine(
    (file) => {
      const supportedTypes = [
        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/tif",
        "image/avif",
        "image/heic",
        "image/heif",
        "image/bmp",
        "image/gif",
        "image/svg+xml",
        // Documents
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.ms-excel",
      ];
      return supportedTypes.includes(file.type);
    },
    {
      message:
        "Please upload a supported file format (Images: JPEG, PNG, WebP, HEIC, TIFF, AVIF, BMP, GIF, SVG | Documents: PDF, TXT, DOCX, XLSX, DOC, XLS)",
    }
  )
  .refine(
    (file) => file.size <= 15 * 1024 * 1024, // 15MB limit
    {
      message: "File size must be less than 15MB",
    }
  )
  .refine((file) => file.size > 0, {
    message: "File is required",
  });

export const CreateAttachmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: AttachmentTypeEnum,
  file: AttachmentFileSchema,
});

export type CreateAttachmentType = z.infer<typeof CreateAttachmentSchema>;
