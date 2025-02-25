"use client";

import { useState, useRef, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product, Price, Upload } from "../../../utils/types/schema.type";
import { createProduct } from "@/lib/server/createProduct";
import { toast } from "@/hooks/use-toast";
import { BasicProductInfo } from "@/components/Products/BasicProductInfo";
import { PriceVariants } from "@/components/Products/PriceVariants";
import { PriceSummary } from "@/components/Products/PriceSummary";
import { UploadImage } from "@/components/Products/UploadImage";

type ProductData = {
  name: string;
  price: Price[];
  picture: Upload | null;
};

const initialProductData: ProductData = {
  name: "",
  price: [
    {
      id: `variant-${Date.now()}`,
      price: 0,
      stock: 0,
      type: "FIFTY_KG",
      productId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      profit: [],
      specialPrice: [],
    },
  ],
  picture: null,
};

export interface CreateProductProps {
  onProductCreated?: (product: Product & { Price?: Price[] }) => void;
}

export function CreateProduct({ onProductCreated }: CreateProductProps) {
  const [productData, setProductData] =
    useState<ProductData>(initialProductData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleBasicInfoChange = (field: "name", value: string) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceVariantsChange: Dispatch<SetStateAction<Price[]>> = (variantsOrUpdater) => {
    setProductData((prev) => {
      const newVariants = typeof variantsOrUpdater === 'function'
        ? variantsOrUpdater(prev.price)
        : variantsOrUpdater;
      return { ...prev, price: newVariants };
    });
  };

  const handleImageChange = (picture: Upload | null) => {
    setProductData((prev) => ({ ...prev, picture }));
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSubmitting(true);

      const trimmedName = productData.name.trim();
      if (!trimmedName) {
        setError("Product name is required");
        setSubmitting(false);
        return;
      }

      if (!productData.picture) {
        setError("Product image is required");
        setSubmitting(false);
        return;
      }

      if (productData.price.length === 0) {
        setError("At least one price variant is required");
        setSubmitting(false);
        return;
      }

      for (let i = 0; i < productData.price.length; i++) {
        const variant = productData.price[i];
        if (variant.price <= 0) {
          setError(`Price for variant #${i + 1} must be greater than 0`);
          setSubmitting(false);
          return;
        }
        if (variant.stock < 0) {
          setError(`Stock for variant #${i + 1} cannot be negative`);
          setSubmitting(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("price", JSON.stringify(productData.price))

      if (productData.picture) {
        formData.append("picture", productData.picture.file);
        formData.append(
          "picture",
          JSON.stringify({
            fileName: productData.picture.fileName,
            path: "product",
          })
        );
      }
      console.log("Product:", productData);
      console.log("Product name:", trimmedName);
      console.log("Price variants:", JSON.stringify(productData.price));
      console.log("Selected picture:", productData.picture);

      const createdProduct = await createProduct(formData);

      if (onProductCreated) {
        onProductCreated(createdProduct);
      }

      toast({
        title: "Product created successfully",
        description: `Added ${trimmedName} with ${productData.price.length} price variant(s)`,
      });

      // Reset the product data
      setProductData(initialProductData);
      closeRef.current?.click();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <BasicProductInfo
            product={productData}
            handleInputChange={handleBasicInfoChange}
          />
          <UploadImage onFileChange={handleImageChange} required />
          <PriceVariants
            prices={productData.price}
            setPrices={handlePriceVariantsChange}
          />
          <PriceSummary prices={productData.price} />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <DialogClose ref={closeRef} asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProduct;
