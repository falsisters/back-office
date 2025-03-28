"use client";

import React, { useState } from "react";
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
import { GetProductByIdResponse } from "../../../utils/types/getProductById.type";
import { SackTypeEnum } from "../../../utils/types/schema.type";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface EditProductProps {
  productId: string;
  onProductUpdated?: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  productId,
  onProductUpdated,
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [product, setProduct] = useState<GetProductByIdResponse | null>(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [sackPrices, setSackPrices] = useState<
    Array<{
      id?: string;
      type: z.infer<typeof SackTypeEnum>;
      price: number;
      stock: number;
      specialPrice?: {
        price?: number;
        minimumQty?: number;
      };
    }>
  >([]);
  const [perKiloPrice, setPerKiloPrice] = useState<{
    id?: string;
    price: number;
    stock: number;
  }>({
    id: undefined,
    price: 0,
    stock: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDialogOpen = async () => {
    setIsDialogOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProductById(productId);

      if (result.data) {
        const fetchedProduct = result.data;
        setProduct(fetchedProduct);
        setName(fetchedProduct.name);

        // Set Sack Prices
        setSackPrices(
          fetchedProduct.SackPrice.map((sp) => ({
            id: sp.id,
            type: sp.type,
            price: sp.price,
            stock: sp.stock,
            specialPrice: sp.specialPrice
              ? {
                  price: sp.specialPrice.price,
                  minimumQty: sp.specialPrice.minimumQty,
                }
              : undefined,
          }))
        );

        // Set Per Kilo Price
        if (
          fetchedProduct.perKiloPrice &&
          fetchedProduct.perKiloPrice.length > 0
        ) {
          const perKilo = fetchedProduct.perKiloPrice[0];
          setPerKiloPrice({
            id: perKilo.id,
            price: perKilo.price,
            stock: perKilo.stock,
          });
        }
      } else if (result.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch product";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);

      if (picture) {
        formData.append("picture", picture);
      }

      formData.append(
        "sackPrices",
        JSON.stringify(
          sackPrices.map((sp) => ({
            id: sp.id,
            price: sp.price,
            stock: sp.stock,
            type: sp.type,
            specialPrice: sp.specialPrice,
          }))
        )
      );

      formData.append(
        "perKiloPrice",
        JSON.stringify({
          id: perKiloPrice.id,
          price: perKiloPrice.price,
          stock: perKiloPrice.stock,
        })
      );

      const result = await editProduct(productId, formData);
      console.log("Product Updated: ", result);

      toast({
        title: "Product Updated",
        description: "The product has been successfully updated.",
      });

      onProductUpdated?.();
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error: ", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleDialogOpen}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <>
              <DialogHeader>
                <DialogTitle>Error</DialogTitle>
              </DialogHeader>
              <p>{error}</p>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </>
          ) : product ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit Product: {product.name}</DialogTitle>
              </DialogHeader>
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
                  <Label>Current Product Image</Label>
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={product.picture}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <Label>Update Product Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPicture(e.target.files?.[0] || null)}
                  />
                </div>

                {/* Sack Prices Section */}
                <div>
                  <Label>Sack Prices</Label>
                  {sackPrices.map((sackPrice, index) => (
                    <div
                      key={sackPrice.id || index}
                      className="flex space-x-2 mb-2"
                    >
                      <Select
                        value={sackPrice.type}
                        onValueChange={(value) => {
                          const newSackPrices = [...sackPrices];
                          newSackPrices[index].type = value as z.infer<
                            typeof SackTypeEnum
                          >;
                          setSackPrices(newSackPrices);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sack Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(SackTypeEnum.enum).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={sackPrice.price}
                        onChange={(e) => {
                          const newSackPrices = [...sackPrices];
                          newSackPrices[index].price = Number(e.target.value);
                          setSackPrices(newSackPrices);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={sackPrice.stock}
                        onChange={(e) => {
                          const newSackPrices = [...sackPrices];
                          newSackPrices[index].stock = Number(e.target.value);
                          setSackPrices(newSackPrices);
                        }}
                      />
                      {/* Special Price Section */}
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Special Price"
                          value={sackPrice.specialPrice?.price || ""}
                          onChange={(e) => {
                            const newSackPrices = [...sackPrices];
                            newSackPrices[index].specialPrice = {
                              ...newSackPrices[index].specialPrice,
                              price: Number(e.target.value),
                            };
                            setSackPrices(newSackPrices);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Min Qty"
                          value={sackPrice.specialPrice?.minimumQty || ""}
                          onChange={(e) => {
                            const newSackPrices = [...sackPrices];
                            newSackPrices[index].specialPrice = {
                              ...newSackPrices[index].specialPrice,
                              minimumQty: Number(e.target.value),
                            };
                            setSackPrices(newSackPrices);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSackPrices([
                        ...sackPrices,
                        { type: "FIFTY_KG", price: 0, stock: 0 },
                      ])
                    }
                  >
                    Add Sack Price
                  </Button>
                </div>

                {/* Per Kilo Price Section */}
                <div>
                  <Label>Per Kilo Price</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Price per Kilo"
                      value={perKiloPrice.price}
                      onChange={(e) =>
                        setPerKiloPrice({
                          ...perKiloPrice,
                          price: Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={perKiloPrice.stock}
                      onChange={(e) =>
                        setPerKiloPrice({
                          ...perKiloPrice,
                          stock: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Button type="submit">Update Product</Button>
              </form>
            </>
          ) : null}
        </DialogContent>
      </DialogHeader>
    </Dialog>
  );
};

export default EditProduct;
