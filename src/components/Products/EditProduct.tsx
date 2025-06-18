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
  type SackType,
  type SackPrice,
  type SpecialPrice,
  SackTypeEnum,
} from "../../../utils/types/schema.type";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { CurrencyCalculator } from "../../../utils/currencyCalculator";

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
    profit?: number; // Make this optional
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

        // Handle SackPrice array
        setSackPrices(
          fetchedProduct.SackPrice.map((sp: any) => ({
            id: sp?.id,
            type: sp?.type || "FIFTY_KG",
            price: sp?.price ?? 0,
            stock: sp?.stock ?? 0,
            profit: sp?.profit, // Keep as undefined if not set
            specialPrice: sp?.specialPrice
              ? {
                  id: sp.specialPrice?.id,
                  price: sp.specialPrice?.price ?? 0,
                  minimumQty: sp.specialPrice?.minimumQty ?? 0,
                  profit: sp.specialPrice?.profit, // Keep as undefined if not set
                }
              : null,
          }))
        );

        // Handle per kilo price (now nullable instead of array)
        if (fetchedProduct.perKiloPrice) {
          setPerKiloPrice({
            id: fetchedProduct.perKiloPrice.id,
            price: fetchedProduct.perKiloPrice.price ?? 0,
            stock: fetchedProduct.perKiloPrice.stock ?? 0,
            profit: fetchedProduct.perKiloPrice.profit, // Keep as undefined if not set
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

    if (file) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file format",
          description: "Please upload only JPG or PNG images",
          variant: "destructive",
        });
        // Reset the input
        e.target.value = "";
        return;
      }

      // Check file size (3MB = 3 * 1024 * 1024 bytes)
      const maxSize = 3 * 1024 * 1024; // 3MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 3MB",
          variant: "destructive",
        });
        // Reset the input
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
      // Keep the existing preview when no new file is selected
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Product name is required"; // Check that at least one pricing option is provided
    const hasSackPrices = sackPrices.length > 0;
    const hasPerKiloPrice =
      perKiloPrice && perKiloPrice.price > 0 && perKiloPrice.stock >= 0;

    if (!hasSackPrices && !hasPerKiloPrice) {
      newErrors.pricing =
        "At least one pricing option (sack prices or per kilo price) is required";
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

  const addSackPrice = () => {
    const availableTypes = Object.values(SackTypeEnum.enum).filter(
      (type) => !sackPrices.some((sp) => sp.type === type)
    );

    if (availableTypes.length === 0) {
      toast({ title: "All sack types already added", variant: "destructive" });
      return;
    }

    setSackPrices([
      ...sackPrices,
      {
        type: availableTypes[0],
        price: 0,
        stock: 0,
      },
    ]);
  };

  const removeSackPrice = (index: number) => {
    const newSackPrices = [...sackPrices];
    newSackPrices.splice(index, 1);
    setSackPrices(newSackPrices);
  };

  const removeSpecialPrice = (index: number) => {
    const newSackPrices = [...sackPrices];
    if (newSackPrices[index].specialPrice) {
      const specialPriceId = newSackPrices[index].specialPrice?.id;
      newSackPrices[index].specialPrice = {
        id: specialPriceId,
        price: 0,
        minimumQty: 0,
        profit: 0,
      };
    }
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
        profit:
          sp.profit !== undefined
            ? CurrencyCalculator.round(sp.profit)
            : undefined,
        specialPrice: sp.specialPrice
          ? {
              id: sp.specialPrice.id,
              price: sp.specialPrice.price,
              minimumQty: sp.specialPrice.minimumQty,
              profit:
                sp.specialPrice.profit !== undefined
                  ? CurrencyCalculator.round(sp.specialPrice.profit)
                  : undefined,
            }
          : null,
      }));
      formData.append("sackPrice", JSON.stringify(sackPricesData));

      if (perKiloPrice) {
        formData.append(
          "perKiloPrice",
          JSON.stringify({
            id: perKiloPrice.id,
            price: perKiloPrice.price,
            stock: perKiloPrice.stock,
            profit:
              perKiloPrice.profit !== undefined
                ? CurrencyCalculator.round(perKiloPrice.profit)
                : undefined,
          })
        );
      } else {
        // Send null when perKiloPrice is not set
        formData.append("perKiloPrice", JSON.stringify(null));
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

  // Utility function to prevent wheel events on number inputs
  const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Reset state when dialog closes
          setProduct(null);
          setErrors({});
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Sack Prices</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSackPrice}
                    className="h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Plus size={14} />
                    Add
                  </Button>
                </div>

                {errors.pricing && (
                  <p className="text-xs text-destructive">{errors.pricing}</p>
                )}

                {errors.sackPrices && (
                  <p className="text-xs text-destructive">
                    {errors.sackPrices}
                  </p>
                )}

                {sackPrices.length === 0 ? (
                  <div className="text-center py-4 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">
                      No sack prices added yet
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addSackPrice}
                      className="mt-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Add Sack Price
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sackPrices.map((sack, index) => (
                      <div
                        key={sack.id || index}
                        className="space-y-3 border p-4 rounded-lg relative hover:shadow-sm transition-shadow"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSackPrice(index)}
                          className="h-6 w-6 absolute top-2 right-2 text-destructive hover:bg-destructive/10"
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
                              <SelectTrigger className="focus:ring-primary">
                                <SelectValue placeholder="Sack Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(SackTypeEnum.enum).map(
                                  (type) => {
                                    const isUsed = sackPrices.some(
                                      (sp, i) => i !== index && sp.type === type
                                    );
                                    return (
                                      <SelectItem
                                        key={type}
                                        value={type}
                                        disabled={isUsed}
                                      >
                                        {type === "FIFTY_KG"
                                          ? "50 KG"
                                          : type === "TWENTY_FIVE_KG"
                                          ? "25 KG"
                                          : "5 KG"}
                                      </SelectItem>
                                    );
                                  }
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Price (₱)</Label>
                            <Input
                              type="number"
                              placeholder="Price"
                              value={sack.price || ""}
                              onChange={(e) => {
                                const newSackPrices = [...sackPrices];
                                newSackPrices[index].price = Number(
                                  e.target.value
                                );
                                setSackPrices(newSackPrices);
                              }}
                              onWheel={preventWheelChange}
                              min="0"
                              step="0.01"
                              className={
                                errors[`sackPrice_${index}_price`]
                                  ? "border-destructive"
                                  : "focus-visible:ring-primary"
                              }
                            />
                            {errors[`sackPrice_${index}_price`] && (
                              <p className="text-xs text-destructive">
                                {errors[`sackPrice_${index}_price`]}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Stock</Label>{" "}
                            <Input
                              type="number"
                              placeholder="Stock"
                              value={
                                sack.stock !== undefined && sack.stock !== null
                                  ? sack.stock.toString()
                                  : ""
                              }
                              onChange={(e) => {
                                const newSackPrices = [...sackPrices];
                                newSackPrices[index].stock = Number(
                                  e.target.value
                                );
                                setSackPrices(newSackPrices);
                              }}
                              onWheel={preventWheelChange}
                              min="0"
                              className={
                                errors[`sackPrice_${index}_stock`]
                                  ? "border-destructive"
                                  : "focus-visible:ring-primary"
                              }
                            />
                            {errors[`sackPrice_${index}_stock`] && (
                              <p className="text-xs text-destructive">
                                {errors[`sackPrice_${index}_stock`]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Profit (₱)</Label>
                            <Input
                              type="number"
                              placeholder="Profit (optional)"
                              value={
                                sack.profit !== undefined
                                  ? sack.profit.toString()
                                  : ""
                              }
                              onChange={(e) => {
                                const newSackPrices = [...sackPrices];
                                const value = e.target.value;
                                if (value === "") {
                                  newSackPrices[index].profit = undefined;
                                } else {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue)) {
                                    newSackPrices[index].profit =
                                      CurrencyCalculator.round(numValue);
                                  }
                                }
                                setSackPrices(newSackPrices);
                              }}
                              onWheel={preventWheelChange}
                              min="0"
                              step="1"
                              className="focus-visible:ring-primary"
                            />
                          </div>
                        </div>

                        <Separator className="my-2" />

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                              Special Price (Optional)
                            </Label>
                            {sack.specialPrice &&
                              sack.specialPrice &&
                              (sack.specialPrice.price ?? 0) > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSpecialPrice(index)}
                                  className="h-6 text-xs text-destructive hover:bg-destructive/10"
                                >
                                  Remove Special Price
                                </Button>
                              )}
                          </div>
                          {sack.specialPrice ? (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  Special Price (₱)
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="Special Price"
                                  value={sack.specialPrice?.price || ""}
                                  onChange={(e) => {
                                    const newSackPrices = [...sackPrices];
                                    if (!newSackPrices[index].specialPrice) {
                                      newSackPrices[index].specialPrice = {
                                        price: 0,
                                        minimumQty: 0,
                                      };
                                    }
                                    newSackPrices[index].specialPrice!.price =
                                      Number(e.target.value);
                                    setSackPrices(newSackPrices);
                                  }}
                                  onWheel={preventWheelChange}
                                  min="0"
                                  step="0.01"
                                  className="focus-visible:ring-secondary"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    Minimum Quantity
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="Min Qty"
                                    value={sack.specialPrice?.minimumQty || ""}
                                    onChange={(e) => {
                                      const newSackPrices = [...sackPrices];
                                      if (!newSackPrices[index].specialPrice) {
                                        newSackPrices[index].specialPrice = {
                                          price: 0,
                                          minimumQty: 0,
                                          profit: 0,
                                        };
                                      }
                                      newSackPrices[
                                        index
                                      ].specialPrice!.minimumQty = Number(
                                        e.target.value
                                      );
                                      setSackPrices(newSackPrices);
                                    }}
                                    onWheel={preventWheelChange}
                                    min="0"
                                    className={
                                      errors[
                                        `sackPrice_${index}_specialPrice_minimumQty`
                                      ]
                                        ? "border-destructive"
                                        : "focus-visible:ring-secondary"
                                    }
                                  />
                                  {errors[
                                    `sackPrice_${index}_specialPrice_minimumQty`
                                  ] && (
                                    <p className="text-xs text-destructive">
                                      {
                                        errors[
                                          `sackPrice_${index}_specialPrice_minimumQty`
                                        ]
                                      }
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Profit (₱)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Profit (optional)"
                                    value={
                                      sack.specialPrice?.profit !== undefined
                                        ? sack.specialPrice.profit.toString()
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const newSackPrices = [...sackPrices];
                                      if (!newSackPrices[index].specialPrice) {
                                        newSackPrices[index].specialPrice = {
                                          price: 0,
                                          minimumQty: 0,
                                          profit: 0,
                                        };
                                      }
                                      const value = e.target.value;
                                      if (value === "") {
                                        newSackPrices[
                                          index
                                        ].specialPrice!.profit = undefined;
                                      } else {
                                        const numValue = parseFloat(value);
                                        if (!isNaN(numValue)) {
                                          newSackPrices[
                                            index
                                          ].specialPrice!.profit =
                                            CurrencyCalculator.round(numValue);
                                        }
                                      }
                                      setSackPrices(newSackPrices);
                                    }}
                                    onWheel={preventWheelChange}
                                    min="0"
                                    step="1"
                                    className="focus-visible:ring-secondary"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSackPrices = [...sackPrices];
                                newSackPrices[index].specialPrice = {
                                  price: 0,
                                  minimumQty: 0,
                                  profit: 0,
                                };
                                setSackPrices(newSackPrices);
                              }}
                              className="w-full h-8 text-xs text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                            >
                              Add Special Price
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

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
                          ? perKiloPrice.stock.toString()
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
                        perKiloPrice?.profit !== undefined
                          ? perKiloPrice.profit.toString()
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
