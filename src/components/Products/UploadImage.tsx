"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelected: (file: File) => void
  currentImageUrl?: string
}

export function UploadImage({ onImageSelected, currentImageUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelected(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("product-image")?.click()}
        >
          Select Image
        </Button>
        <input
          type="file"
          id="product-image"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      {preview && (
        <div className="relative w-40 h-40">
          <Image
            src={preview}
            alt="Product preview"
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
    </div>
  )
}