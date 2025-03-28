import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editProduct } from '@/lib/server/editProduct';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface UploadImageProps {
  productId: string;
  currentImage: string;
  onImageUpdated?: () => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ 
  productId, 
  currentImage, 
  onImageUpdated 
}) => {
  const { toast } = useToast()
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast({
        title: "Error, Please select an image to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('picture', image);

      await editProduct(productId, formData);
      
      toast({
        title: "Image Updated",
      });

      onImageUpdated?.();
      setImage(null);
      setPreviewImage(null);
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive"
      });
      console.error("Error: ", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-48">
        <Image 
          src={previewImage || currentImage} 
          alt="Product" 
          fill 
          className="object-cover rounded-md" 
        />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
        
        {image && (
          <Button type="submit">Upload New Image</Button>
        )}
      </form>
    </div>
  );
};

export default UploadImage;