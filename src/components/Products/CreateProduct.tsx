"use client";

import type React from "react";

import { useState } from "react";
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
import { createProduct } from "@/lib/server/Products/createProduct";
import { SackTypeEnum, type SackType } from "../../../utils/types/schema.type";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface CreateProductProps {
  onProductCreated: (newProduct: unknown) => void;
}

export default function CreateProduct({
  onProductCreated,
}: CreateProductProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [sackPrices, setSackPrices] = useState<
    Array<{
      type: SackType;
      price: number;
      stock: number;
      profit?: number; // Make this optional
      specialPrice?: {
        price: number;
        minimumQty: number;
        profit?: number; // Make this optional
      };
    }>
  >([]);
  const [perKiloPrice, setPerKiloPrice] = useState<{
    price: number;
    stock: number;
    profit?: number; // Make this optional
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName("");
    setPicture(null);
    setPicturePreview(null);
    setSackPrices([]);
    setPerKiloPrice(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const usedTypes = new Set<string>();

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!picture) newErrors.picture = "Product image is required";

    // Check that at least one pricing option is provided
    const hasSackPrices = sackPrices.length > 0;
    const hasPerKiloPrice =
      perKiloPrice && perKiloPrice.price > 0 && perKiloPrice.stock > 0;

    if (!hasSackPrices && !hasPerKiloPrice) {
      newErrors.pricing =
        "At least one pricing option (sack prices or per kilo price) is required";
    }

    sackPrices.forEach((sack, index) => {
      if (!sack.price)
        newErrors[`sackPrice_${index}_price`] = "Price is required";
      if (!sack.stock)
        newErrors[`sackPrice_${index}_stock`] = "Stock is required";

      if (sack.specialPrice?.price && !sack.specialPrice?.minimumQty) {
        newErrors[`sackPrice_${index}_specialPrice_minimumQty`] =
          "Minimum quantity is required for special price";
      }
      if (usedTypes.has(sack.type)) {
        newErrors[`type_${index}`] = "Sack type already exists";
      }
      usedTypes.add(sack.type);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    console.log("Form submission - perKiloPrice:", perKiloPrice);

    try {
      const formData = new FormData();
      if (picture) formData.append("picture", picture);
      formData.append("name", name);
      formData.append(
        "sackPrice",
        JSON.stringify(
          sackPrices.map((sack) => ({
            ...sack,
            profit:
              sack.profit !== undefined
                ? Number(sack.profit.toFixed(2))
                : undefined,
            specialPrice: sack.specialPrice
              ? {
                  ...sack.specialPrice,
                  profit:
                    sack.specialPrice.profit !== undefined
                      ? Number(sack.specialPrice.profit.toFixed(2))
                      : undefined,
                }
              : undefined,
          }))
        )
      );
      if (perKiloPrice) {
        formData.append(
          "perKiloPrice",
          JSON.stringify({
            ...perKiloPrice,
            profit:
              perKiloPrice.profit !== undefined
                ? Number(perKiloPrice.profit.toFixed(2))
                : undefined,
          })
        );
      }

      const newProduct = await createProduct(formData);
      console.log("Form Data contents:");
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      onProductCreated(newProduct);

      toast({
        title: "Product Created Successfully",
        description: `${name} has been added to your products`,
      });

      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error Creating Product",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      setPicturePreview(null);
    }
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
        profit: 0,
      },
    ]);
  };

  const removeSackPrice = (index: number) => {
    const newSackPrices = [...sackPrices];
    newSackPrices.splice(index, 1);
    setSackPrices(newSackPrices);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-secondary text-white hover:bg-secondary/90 shadow-md"
          size="default"
        >
          <Plus size={16} />
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] border-t-4 border-t-secondary p-0">
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl text-secondary font-bold">
              Create New Product
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name
              </Label>
              <Input
                id="name"
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
              <Label htmlFor="picture" className="text-sm font-medium">
                Product Image
              </Label>
              <Input
                id="picture"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className={
                  errors.picture
                    ? "border-destructive"
                    : "focus-visible:ring-primary"
                }
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG. Maximum size: 3MB
              </p>
              {errors.picture && (
                <p className="text-xs text-destructive mt-1">
                  {errors.picture}
                </p>
              )}

              {picturePreview && (
                <div className="mt-2 relative w-full h-40">
                  <Image
                    src={picturePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-md border"
                    width={50}
                    height={50}
                  />
                </div>
              )}
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
                <p className="text-xs text-destructive">{errors.sackPrices}</p>
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
                      key={index}
                      className="space-y-3 border p-4 rounded-lg relative hover:shadow-sm transition-shadow"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSackPrice(index)}
                        className="h-6 w-6 absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={14} />
                      </Button>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={sack.type}
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
                              {Object.values(SackTypeEnum.enum).map((type) => {
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
                              })}
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
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            placeholder="Stock"
                            value={sack.stock || ""}
                            onChange={(e) => {
                              const newSackPrices = [...sackPrices];
                              newSackPrices[index].stock = Number(
                                e.target.value
                              );
                              setSackPrices(newSackPrices);
                            }}
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
                                  newSackPrices[index].profit = numValue;
                                }
                              }
                              setSackPrices(newSackPrices);
                            }}
                            min="0"
                            step="0.01"
                            className="focus-visible:ring-primary"
                          />
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Special Price (Optional)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Special Price (₱)</Label>
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
                                    profit: 0,
                                  };
                                }
                                newSackPrices[index].specialPrice!.price =
                                  Number(e.target.value);
                                setSackPrices(newSackPrices);
                              }}
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
                                    newSackPrices[index].specialPrice!.profit =
                                      undefined;
                                  } else {
                                    const numValue = parseFloat(value);
                                    if (!isNaN(numValue)) {
                                      newSackPrices[
                                        index
                                      ].specialPrice!.profit = numValue;
                                    }
                                  }
                                  setSackPrices(newSackPrices);
                                }}
                                min="0"
                                step="0.01"
                                className="focus-visible:ring-secondary"
                              />
                            </div>
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
                        ...(perKiloPrice || { price: 0, stock: 0, profit: 0 }),
                        price: Number(e.target.value),
                      })
                    }
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
                    value={perKiloPrice?.stock || ""}
                    onChange={(e) =>
                      setPerKiloPrice({
                        ...(perKiloPrice || { price: 0, stock: 0, profit: 0 }),
                        stock: Number(e.target.value),
                      })
                    }
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
                            profit: numValue,
                          });
                        }
                      }
                    }}
                    min="0"
                    step="0.01"
                    className="focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
