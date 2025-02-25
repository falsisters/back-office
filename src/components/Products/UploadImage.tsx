// UploadImage.tsx
"use client"

import { useCallback, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface UploadImageProps {
  onFileChange: (imageData: { fileName: string; path: string; file: File } | null) => void
  initialPreview?: string
  required?: boolean
}

export function UploadImage({ onFileChange, initialPreview, required }: UploadImageProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
        onFileChange({
          fileName: file.name,
          path: 'products',
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  }, [onFileChange])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onFileChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [onFileChange])

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative group">
          <Image
            src={preview || "/placeholder.svg"}
            alt="Image Preview"
            width={200} height={150}
            className="rounded-lg object-cover w-full h-48 border"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="upload-image"
            ref={inputRef}
            required={required}
          />
          <label
            htmlFor="upload-image"
            className="cursor-pointer inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            Choose an image
          </label>
        </div>
      )}
    </div>
  )
}