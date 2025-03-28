"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editProduct } from "@/lib/server/editProduct";
import { getProductById } from "@/lib/server/getProductById";
import { SackType } from "../../../utils/types/schema.type";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type";

interface EditProductProps {
  productId: string;
  onProductUpdated?: () => void;
}

interface SackPrice {
  id?: string;
  type: SackType;
  price: number;
  stock: number;
  specialPrice?: {
    id?: string;
    price?: number;
    minimumQty?: number;
  };
}

const EditProduct: React.FC<EditProductProps> = ({
  productId,
  onProductUpdated,
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [sackPrices, setSackPrices] = useState<SackPrice[]>([]);
  const [perKiloPrice, setPerKiloPrice] = useState<{
    id?: string;
    price: number;
    stock: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProductById(productId);
      if (result.data) {
        const fetchedProduct = result.data;
        setProduct(fetchedProduct);
        setName(fetchedProduct.name);

        setSackPrices(
          fetchedProduct.SackPrice.map((sp) => ({
            id: sp.id,
            type: sp.type,
            price: sp.price,
            stock: sp.stock,
            specialPrice: sp.specialPrice
              ? {
                  id: sp.specialPrice.id,
                  price: sp.specialPrice.price,
                  minimumQty: sp.specialPrice.minimumQty,
                }
              : undefined,
          }))
        );

        if (fetchedProduct.perKiloPrice) {
          setPerKiloPrice({
            id: fetchedProduct.perKiloPrice.id,
            price: fetchedProduct.perKiloPrice.price,
            stock: fetchedProduct.perKiloPrice.stock,
          });
        }
      }
    } catch (error) {
      console.error("Error: ", error)
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    if (isDialogOpen && !product) {
      loadProduct();
    }
  }, [isDialogOpen, product, loadProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);

      if (picture) {
        formData.append("picture", picture);
      }

      const sackPricesData = sackPrices.map((sp) => ({
        id: sp.id,
        price: sp.price,
        stock: sp.stock,
        type: sp.type,
        specialPrice: sp.specialPrice
          ? {
              id: sp.specialPrice.id,
              price: sp.specialPrice.price,
              minimumQty: sp.specialPrice.minimumQty,
            }
          : undefined,
      }));
      formData.append("sackPrice", JSON.stringify(sackPricesData));

      if (perKiloPrice) {
        formData.append(
          "perKiloPrice",
          JSON.stringify({
            id: perKiloPrice.id,
            price: perKiloPrice.price,
            stock: perKiloPrice.stock,
          })
        );
      }

      await editProduct(productId, formData);

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      onProductUpdated?.();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div>Loading...</div>
        ) : product ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Current Image</Label>
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={product.picture}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <Label>New Image (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPicture(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-4">
              <Label>Sack Prices</Label>
              {sackPrices.map((sp, index) => (
                <div
                  key={sp.id || index}
                  className="space-y-2 border p-4 rounded-lg"
                >
                  <div className="flex gap-2">
                    <Select
                      value={sp.type}
                      onValueChange={(value) => {
                        const newPrices = [...sackPrices];
                        newPrices[index].type = value as SackType;
                        setSackPrices(newPrices);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sack Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIFTY_KG">50 KG</SelectItem>
                        <SelectItem value="TWENTY_FIVE_KG">25 KG</SelectItem>
                        <SelectItem value="FIVE_KG">5 KG</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={sp.price}
                      onChange={(e) => {
                        const newPrices = [...sackPrices];
                        newPrices[index].price = Number(e.target.value);
                        setSackPrices(newPrices);
                      }}
                      step="0.01"
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={sp.stock}
                      onChange={(e) => {
                        const newPrices = [...sackPrices];
                        newPrices[index].stock = Number(e.target.value);
                        setSackPrices(newPrices);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Special Price (optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={sp.specialPrice?.price || ""}
                        onChange={(e) => {
                          const newPrices = [...sackPrices];
                          newPrices[index].specialPrice = {
                            ...newPrices[index].specialPrice,
                            price: Number(e.target.value),
                          };
                          setSackPrices(newPrices);
                        }}
                        step="0.01"
                      />
                      <Input
                        type="number"
                        placeholder="Min Qty"
                        value={sp.specialPrice?.minimumQty || ""}
                        onChange={(e) => {
                          const newPrices = [...sackPrices];
                          newPrices[index].specialPrice = {
                            ...newPrices[index].specialPrice,
                            minimumQty: Number(e.target.value),
                          };
                          setSackPrices(newPrices);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSackPrices([
                    ...sackPrices,
                    {
                      type: "FIFTY_KG",
                      price: 0,
                      stock: 0,
                    },
                  ])
                }
              >
                Add Sack Price
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Per Kilo Price (optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Price"
                  value={perKiloPrice?.price || ""}
                  onChange={(e) =>
                    setPerKiloPrice({
                      ...(perKiloPrice || { price: 0, stock: 0 }),
                      price: Number(e.target.value),
                    })
                  }
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={perKiloPrice?.stock || ""}
                  onChange={(e) =>
                    setPerKiloPrice({
                      ...(perKiloPrice || { price: 0, stock: 0 }),
                      stock: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Update Product
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;
