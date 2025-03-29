"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import { editProduct } from "@/lib/server/editProduct";
import { getProductById } from "@/lib/server/getProductById";
import { SackType, SackPrice, SpecialPrice } from "../../../utils/types/schema.type";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type";
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';

interface EditProductProps {
  productId: string;
  onProductUpdated?: () => void;
}

type EditableSackPrice = Partial<SackPrice> & {
  specialPrice?: Partial<SpecialPrice>;
};

export default function EditProduct({
  productId,
  onProductUpdated,
}: EditProductProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [sackPrices, setSackPrices] = useState<EditableSackPrice[]>([]);
  const [perKiloPrice, setPerKiloPrice] = useState<{
    id?: string;
    price: number;
    stock: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProductById(productId);
      if (result.data) {
        const fetchedProduct = result.data;
        setProduct(fetchedProduct);
        setName(fetchedProduct.name);
        setPicturePreview(fetchedProduct.picture);
  
        // Ensure SackPrice is treated as an array
        const sackPriceArray = Array.isArray(fetchedProduct.SackPrice) 
          ? fetchedProduct.SackPrice 
          : [];
        
        setSackPrices(
          sackPriceArray.map((sp) => ({
            id: sp?.id,
            type: sp?.type || "FIFTY_KG",
            price: sp?.price ?? 0,
            stock: sp?.stock ?? 0,
            specialPrice: sp?.specialPrice
              ? {
                  id: sp.specialPrice?.id,
                  price: sp.specialPrice?.price ?? 0,
                  minimumQty: sp.specialPrice?.minimumQty ?? 0,
                }
              : undefined,
          }))
        );
  
        // Handle per kilo price
        if (fetchedProduct.perKiloPrice && fetchedProduct.perKiloPrice.length > 0) {
          const kiloPrice = fetchedProduct.perKiloPrice[0];
          setPerKiloPrice({
            id: kiloPrice.id,
            price: kiloPrice.price ?? 0,
            stock: kiloPrice.stock ?? 0,
          });
        } else {
          setPerKiloPrice(null);
        }
      }
    } catch (error) {
      console.error("Error: ", error);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPicture(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "Product name is required";
    if (sackPrices.length === 0) newErrors.sackPrices = "At least one sack price is required";
    
    sackPrices.forEach((sack, index) => {
      if (!sack.price) newErrors[`sackPrice_${index}_price`] = "Price is required";
      if (!sack.stock) newErrors[`sackPrice_${index}_stock`] = "Stock is required";
      
      if (sack.specialPrice?.price && !sack.specialPrice?.minimumQty) {
        newErrors[`sackPrice_${index}_specialPrice_minimumQty`] = "Minimum quantity is required for special price";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSackPrice = () => {
    setSackPrices([...sackPrices, { 
      type: 'FIFTY_KG', 
      price: 0, 
      stock: 0 
    }]);
  };

  const removeSackPrice = (index: number) => {
    const newSackPrices = [...sackPrices];
    newSackPrices.splice(index, 1);
    setSackPrices(newSackPrices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
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
        title: "Product Updated Successfully",
        description: `${name} has been updated`,
      });

      onProductUpdated?.();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error Updating Product",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) {
        // Reset state when dialog closes
        setProduct(null);
        setErrors({});
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Edit size={14} />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Product</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          </div>
        ) : product ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Product Name
              </Label>
              <Input 
                id="edit-name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Image</Label>
              {picturePreview && (
                <div className="relative w-full h-48 rounded-md overflow-hidden border">
                  <Image
                    src={picturePreview || "/placeholder.svg"}
                    alt={name}
                    className="object-cover w-full h-full flex items-center justify-center"
                    width={50}
                    height={50}
                  />
                </div>
              )}
              
              <Label htmlFor="edit-picture" className="text-sm font-medium mt-4 block">
                New Image (optional)
              </Label>
              <Input 
                id="edit-picture"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Sack Prices</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addSackPrice}
                  className="h-8 gap-1"
                >
                  <Plus size={14} />
                  Add
                </Button>
              </div>
              
              {errors.sackPrices && (
                <p className="text-xs text-destructive">{errors.sackPrices}</p>
              )}
              
              {sackPrices.length === 0 ? (
                <div className="text-center py-4 border border-dashed rounded-md">
                  <p className="text-sm text-muted-foreground">No sack prices added yet</p>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={addSackPrice}
                    className="mt-2"
                  >
                    Add Sack Price
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sackPrices.map((sack, index) => (
                    <div key={sack.id || index} className="space-y-3 border p-4 rounded-lg relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSackPrice(index)}
                        className="h-6 w-6 absolute top-2 right-2 text-destructive"
                        disabled={sackPrices.length === 1}
                      >
                        <Trash2 size={14} />
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select 
                            value={sack.type as string} 
                            onValueChange={(value) => {
                              const newSackPrices = [...sackPrices];
                              newSackPrices[index].type = value as SackType;
                              setSackPrices(newSackPrices);
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
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Price (₱)</Label>
                          <Input 
                            type="number" 
                            placeholder="Price" 
                            value={sack.price || ''} 
                            onChange={(e) => {
                              const newSackPrices = [...sackPrices];
                              newSackPrices[index].price = Number(e.target.value);
                              setSackPrices(newSackPrices);
                            }} 
                            min="0" 
                            step="0.01"
                            className={errors[`sackPrice_${index}_price`] ? "border-destructive" : ""}
                          />
                          {errors[`sackPrice_${index}_price`] && (
                            <p className="text-xs text-destructive">{errors[`sackPrice_${index}_price`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Stock</Label>
                        <Input 
                          type="number" 
                          placeholder="Stock" 
                          value={sack.stock || ''} 
                          onChange={(e) => {
                            const newSackPrices = [...sackPrices];
                            newSackPrices[index].stock = Number(e.target.value);
                            setSackPrices(newSackPrices);
                          }} 
                          min="0"
                          className={errors[`sackPrice_${index}_stock`] ? "border-destructive" : ""}
                        />
                        {errors[`sackPrice_${index}_stock`] && (
                          <p className="text-xs text-destructive">{errors[`sackPrice_${index}_stock`]}</p>
                        )}
                      </div>

                      <Separator className="my-2" />
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Special Price (Optional)</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Special Price (₱)</Label>
                            <Input 
                              type="number" 
                              placeholder="Special Price" 
                              value={sack.specialPrice?.price || ''} 
                              onChange={(e) => {
                                const newSackPrices = [...sackPrices];
                                if (!newSackPrices[index].specialPrice) {
                                  newSackPrices[index].specialPrice = { price: 0, minimumQty: 0 };
                                }
                                newSackPrices[index].specialPrice!.price = Number(e.target.value);
                                setSackPrices(newSackPrices);
                              }} 
                              min="0" 
                              step="0.01" 
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Minimum Quantity</Label>
                            <Input 
                              type="number" 
                              placeholder="Min Qty" 
                              value={sack.specialPrice?.minimumQty || ''} 
                              onChange={(e) => {
                                const newSackPrices = [...sackPrices];
                                if (!newSackPrices[index].specialPrice) {
                                  newSackPrices[index].specialPrice = { price: 0, minimumQty: 0 };
                                }
                                newSackPrices[index].specialPrice!.minimumQty = Number(e.target.value);
                                setSackPrices(newSackPrices);
                              }} 
                              min="0"
                              className={errors[`sackPrice_${index}_specialPrice_minimumQty`] ? "border-destructive" : ""}
                            />
                            {errors[`sackPrice_${index}_specialPrice_minimumQty`] && (
                              <p className="text-xs text-destructive">
                                {errors[`sackPrice_${index}_specialPrice_minimumQty`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-sm font-medium">Per Kilo Price (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Price per Kilo (₱)</Label>
                  <Input 
                    type="number" 
                    placeholder="Price per Kilo" 
                    value={perKiloPrice?.price || ''} 
                    onChange={(e) => setPerKiloPrice({
                      ...(perKiloPrice || { price: 0, stock: 0 }),
                      price: Number(e.target.value)
                    })} 
                    min="0" 
                    step="0.01" 
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Stock (KG)</Label>
                  <Input 
                    type="number" 
                    placeholder="Stock" 
                    value={perKiloPrice?.stock || ''} 
                    onChange={(e) => setPerKiloPrice({
                      ...(perKiloPrice || { price: 0, stock: 0 }),
                      stock: Number(e.target.value)
                    })} 
                    min="0" 
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Failed to load product data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
