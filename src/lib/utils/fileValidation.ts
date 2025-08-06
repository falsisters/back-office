// File validation utilities for enhanced format support

export const SUPPORTED_PRODUCT_IMAGE_FORMATS = [
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
] as const;

export const SUPPORTED_ATTACHMENT_IMAGE_FORMATS = [
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
] as const;

export const SUPPORTED_ATTACHMENT_DOCUMENT_FORMATS = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel",
] as const;

export const SUPPORTED_ATTACHMENT_FORMATS = [
  ...SUPPORTED_ATTACHMENT_IMAGE_FORMATS,
  ...SUPPORTED_ATTACHMENT_DOCUMENT_FORMATS,
] as const;

// Add file extension mappings for fallback validation
const PRODUCT_IMAGE_EXTENSIONS = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".tiff": "image/tiff",
  ".tif": "image/tiff",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
} as const;

const ATTACHMENT_IMAGE_EXTENSIONS = {
  ...PRODUCT_IMAGE_EXTENSIONS,
  ".svg": "image/svg+xml",
} as const;

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.toLowerCase().substring(filename.lastIndexOf("."));
};

// Helper function to validate file type with fallback to extension
const isValidImageType = (
  file: File,
  allowedMimeTypes: readonly string[],
  allowedExtensions: Record<string, string>
): boolean => {
  // First check MIME type
  if (allowedMimeTypes.includes(file.type as any)) {
    return true;
  }

  // Fallback to extension check (important for HEIC/HEIF files)
  const extension = getFileExtension(file.name);
  return extension in allowedExtensions;
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    sizeInMB: number;
    detectedType?: string; // Add detected type info
  };
}

export const validateProductImage = (file: File): FileValidationResult => {
  const maxSizeInMB = 15;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const extension = getFileExtension(file.name);
  const detectedType =
    PRODUCT_IMAGE_EXTENSIONS[
      extension as keyof typeof PRODUCT_IMAGE_EXTENSIONS
    ] || file.type;

  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    sizeInMB: Math.round((file.size / (1024 * 1024)) * 100) / 100,
    detectedType,
  };

  // Check file type with extension fallback
  if (
    !isValidImageType(
      file,
      SUPPORTED_PRODUCT_IMAGE_FORMATS,
      PRODUCT_IMAGE_EXTENSIONS
    )
  ) {
    return {
      isValid: false,
      error: `Unsupported file format. Please use: JPEG, PNG, WebP, HEIC, TIFF, AVIF, BMP, or GIF.`,
      fileInfo,
    };
  }

  // Check file size
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size (${fileInfo.sizeInMB}MB) exceeds the maximum limit of ${maxSizeInMB}MB.`,
      fileInfo,
    };
  }

  return {
    isValid: true,
    fileInfo,
  };
};

export const validateAttachmentFile = (file: File): FileValidationResult => {
  const maxSizeInMB = 15;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const extension = getFileExtension(file.name);
  const detectedType =
    ATTACHMENT_IMAGE_EXTENSIONS[
      extension as keyof typeof ATTACHMENT_IMAGE_EXTENSIONS
    ] || file.type;

  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    sizeInMB: Math.round((file.size / (1024 * 1024)) * 100) / 100,
    detectedType,
  };

  // Check if it's an image file
  const isImage = isValidImageType(
    file,
    SUPPORTED_ATTACHMENT_IMAGE_FORMATS,
    ATTACHMENT_IMAGE_EXTENSIONS
  );

  // Check if it's a document file
  const isDocument = SUPPORTED_ATTACHMENT_DOCUMENT_FORMATS.includes(
    file.type as any
  );

  if (!isImage && !isDocument) {
    return {
      isValid: false,
      error: `Unsupported file format. Please use supported image formats (JPEG, PNG, WebP, HEIC, TIFF, AVIF, BMP, GIF, SVG) or documents (PDF, TXT, DOCX, XLSX, DOC, XLS).`,
      fileInfo,
    };
  }

  // Check file size
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size (${fileInfo.sizeInMB}MB) exceeds the maximum limit of ${maxSizeInMB}MB.`,
      fileInfo,
    };
  }

  return {
    isValid: true,
    fileInfo,
  };
};

export const getFileTypeCategory = (
  mimeType: string
): "image" | "document" | "unknown" => {
  if (SUPPORTED_ATTACHMENT_IMAGE_FORMATS.includes(mimeType as any)) {
    return "image";
  }
  if (SUPPORTED_ATTACHMENT_DOCUMENT_FORMATS.includes(mimeType as any)) {
    return "document";
  }
  return "unknown";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
