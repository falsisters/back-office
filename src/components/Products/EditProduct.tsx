"use client";

import type React from "react";
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
import { editProduct } from "@/lib/server/Products/editProduct";
import { getProductById } from "@/lib/server/Products/getProductById";
import {
  type SackPrice,
  type SpecialPrice,
} from "../../../utils/types/schema.type";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { Edit, Loader2 } from "lucide-react";
import { CurrencyCalculator } from "../../../utils/currencyCalculator";
import { getAllCashiersByUserId } from "@/lib/server/Cashier/getAllCashiersByUserId";
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/Cashier/getAllCashiersByUserId.type";
import SackPricesManager from "./SackPricesManager";

interface EditProductProps {
  productId: string;
  onProductUpdated?: () => void;
}

type EditableSackPrice = Partial<SackPrice> & {
  profit?: number;
  specialPrice?: (Partial<SpecialPrice> & { profit?: number }) | null;
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
    profit?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cashiers, setCashiers] = useState<GetAllCashiersByUserIdPayload>([]);
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(null);
  const [isLoadingCashiers, setIsLoadingCashiers] = useState(false);
  
  // Track deleted IDs for proper backend deletion
  const [deletedSackPriceIds, setDeletedSackPriceIds] = useState<string[]>([]);
  const [deletedSpecialPriceIds, setDeletedSpecialPriceIds] = useState<string[]>([]);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProductById(productId);
      if (result.data) {
        const fetchedProduct = result.data;
        setProduct(fetchedProduct);
        setName(fetchedProduct.name);
        setPicturePreview(fetchedProduct.picture);
        setSelectedCashierId(fetchedProduct.cashier?.id || null);

        // Handle SackPrice array
        setSackPrices(
          fetchedProduct.SackPrice.map((sp: any) => ({
            id: sp?.id,
            type: sp?.type || "FIFTY_KG",
            price: sp?.price ?? 0,
            stock: sp?.stock ?? 0,
            profit: sp?.profit,
            specialPrice: sp?.specialPrice
              ? {
                  id: sp.specialPrice?.id,
                  price: sp.specialPrice?.price ?? 0,
                  minimumQty: sp.specialPrice?.minimumQty ?? 0,
                  profit: sp.specialPrice?.profit,
                }
              : null,
          }))
        );

        // Handle per kilo price
        if (fetchedProduct.perKiloPrice) {
          setPerKiloPrice({
            id: fetchedProduct.perKiloPrice.id,
            price: fetchedProduct.perKiloPrice.price ?? 0,
            stock: fetchedProduct.perKiloPrice.stock ?? 0,
            profit: fetchedProduct.perKiloPrice.profit,
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

  const loadCashiers = useCallback(async () => {
    setIsLoadingCashiers(true);
    try {
      const cashiersList = await getAllCashiersByUserId();
      setCashiers(cashiersList);
    } catch (error) {
      console.error("Error loading cashiers:", error);
    } finally {
      setIsLoadingCashiers(false);
    }
  }, []);

  useEffect(() => {
    if (isDialogOpen && !product) {
      loadProduct();
      loadCashiers();
    }
  }, [isDialogOpen, product, loadProduct, loadCashiers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file format",
          description: "Please upload only JPG or PNG images",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }

      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 3MB",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }

      setPicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPicture(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    
    // Only consider active sack prices for validation
    const hasSackPrices = sackPrices.length > 0;
    const hasPerKiloPrice = perKiloPrice && perKiloPrice.price > 0 && perKiloPrice.stock >= 0;

    if (!hasSackPrices && !hasPerKiloPrice) {
      newErrors.pricing = "At least one pricing option (sack prices or per kilo price) is required";
    }

    sackPrices.forEach((sack, index) => {
      if (!sack.price)
        newErrors[`sackPrice_${index}_price`] = "Price is required";
      if (sack.stock === undefined || sack.stock === null || sack.stock < 0)
        newErrors[`sackPrice_${index}_stock`] = "Stock must be 0 or greater";

      if (sack.specialPrice?.price && !sack.specialPrice?.minimumQty) {
        newErrors[`sackPrice_${index}_specialPrice_minimumQty`] =
          "Minimum quantity is required for special price";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      if (selectedCashierId) {
        formData.append("cashierId", selectedCashierId);
      }

      // Process sack prices - send clean data without deletion flags
      const sackPricesData = sackPrices.map((sp) => ({
        id: sp.id,
        price: sp.price,
        stock: sp.stock,
        type: sp.type,
        profit: sp.profit !== undefined ? CurrencyCalculator.round(sp.profit) : undefined,
        specialPrice: sp.specialPrice
          ? {
              id: sp.specialPrice.id,
              price: sp.specialPrice.price,
              minimumQty: sp.specialPrice.minimumQty,
              profit: sp.specialPrice.profit !== undefined
                ? CurrencyCalculator.round(sp.specialPrice.profit)
                : undefined,
            }
          : null,
      }));

      formData.append("sackPrice", JSON.stringify(sackPricesData));
      
      // Send deleted IDs separately
      if (deletedSackPriceIds.length > 0) {
        formData.append("deletedSackPriceIds", JSON.stringify(deletedSackPriceIds));
      }
      
      if (deletedSpecialPriceIds.length > 0) {
        formData.append("deletedSpecialPriceIds", JSON.stringify(deletedSpecialPriceIds));
      }

      if (perKiloPrice) {
        formData.append(
          "perKiloPrice",
          JSON.stringify({
            id: perKiloPrice.id,
            price: perKiloPrice.price,
            stock: perKiloPrice.stock,
            profit: perKiloPrice.profit !== undefined
              ? CurrencyCalculator.round(perKiloPrice.profit)
              : undefined,
          })
        );
      } else {
        formData.append("perKiloPrice", JSON.stringify(null));
      }

      await editProduct(productId, formData);

      toast({
        title: "Product Updated Successfully",
        description: `${name} has been updated`,
      });

      onProductUpdated?.();
      setIsDialogOpen(false);
      
      // Reset deletion tracking
      setDeletedSackPriceIds([]);
      setDeletedSpecialPriceIds([]);
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

  const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setProduct(null);
          setErrors({});
          // Reset deletion tracking when dialog closes
          setDeletedSackPriceIds([]);
          setDeletedSpecialPriceIds([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Edit size={14} />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] border-t-4 border-t-secondary p-0">
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary font-bold">
              Edit Product
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading product details...
              </p>
            </div>
          ) : product ? (
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Cashier Assignment Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigned Cashier</Label>
                <Select
                  value={selectedCashierId || ""}
                  onValueChange={setSelectedCashierId}
                  disabled={isLoadingCashiers}
                >
                  <SelectTrigger className="focus-visible:ring-primary">
                    <SelectValue placeholder="Select cashier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cashiers.map((cashier) => (
                      <SelectItem key={cashier.id} value={cashier.id}>
                        {cashier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Reassign this product to a different cashier (optional)
                </p>
              </div>

              <Separator />

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Product Name
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={
                    errors.name
                      ? "border-destructive"
                      : "focus-visible:ring-primary"
                  }
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              {/* Product Image */}
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

                <Label
                  htmlFor="edit-picture"
                  className="text-sm font-medium mt-4 block"
                >
                  New Image (optional)
                </Label>
                <Input
                  id="edit-picture"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG. Maximum size: 3MB
                </p>
              </div>

              <Separator />

              {/* Sack Prices Manager */}
              <SackPricesManager
                  sackPrices={sackPrices}
                  setSackPrices={setSackPrices}
                  errors={errors}
                  setDeletedSackPriceIds={setDeletedSackPriceIds}
                  setDeletedSpecialPriceIds={setDeletedSpecialPriceIds} deletedSackPriceIds={[]} deletedSpecialPriceIds={[]}              />

              <Separator />

              {/* Per Kilo Price */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Per Kilo Price (Optional)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Price per Kilo (₱)</Label>
                    <Input
                      type="number"
                      placeholder="Price per Kilo"
                      value={perKiloPrice?.price || ""}
                      onChange={(e) =>
                        setPerKiloPrice({
                          ...(perKiloPrice || { price: 0, stock: 0 }),
                          price: Number(e.target.value),
                        })
                      }
                      onWheel={preventWheelChange}
                      min="0"
                      step="0.01"
                      className="focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Stock (KG)</Label>
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={
                        perKiloPrice?.stock !== undefined &&
                        perKiloPrice?.stock !== null
                          ? String(perKiloPrice.stock)
                          : ""
                      }
                      onChange={(e) =>
                        setPerKiloPrice({
                          ...(perKiloPrice || {
                            price: 0,
                            stock: 0,
                            profit: 0,
                          }),
                          stock: Number(e.target.value),
                        })
                      }
                      onWheel={preventWheelChange}
                      min="0"
                      step="0.01"
                      className="focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Profit (₱)</Label>
                    <Input
                      type="number"
                      placeholder="Profit (optional)"
                      value={
                        perKiloPrice?.profit !== undefined &&
                        perKiloPrice?.profit !== null
                          ? String(perKiloPrice.profit)
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setPerKiloPrice({
                            ...(perKiloPrice || { price: 0, stock: 0 }),
                            profit: undefined,
                          });
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            setPerKiloPrice({
                              ...(perKiloPrice || { price: 0, stock: 0 }),
                              profit: CurrencyCalculator.round(numValue),
                            });
                          }
                        }
                      }}
                      onWheel={preventWheelChange}
                      min="0"
                      step="1"
                      className="focus-visible:ring-primary"
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
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
        </div>
      </DialogContent>
    </Dialog>
  );
}