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
import { validateProductImage } from "@/lib/utils/fileValidation";
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
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );
  const [isLoadingCashiers, setIsLoadingCashiers] = useState(false);

  // Track deleted IDs for proper backend deletion
  const [deletedSackPriceIds, setDeletedSackPriceIds] = useState<string[]>([]);
  const [deletedSpecialPriceIds, setDeletedSpecialPriceIds] = useState<
    string[]
  >([]);

  // Helper function to safely parse decimal values from API
  const parseApiDecimal = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "string") return parseFloat(value) || 0;
    if (typeof value === "number") return value;
    return 0;
  };

  // Helper function to format decimal values for input display
  const formatDecimalForInput = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "";
    return value.toString();
  };

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

        // Handle SackPrice array with proper decimal parsing
        setSackPrices(
          fetchedProduct.SackPrice.map((sp: any) => ({
            id: sp?.id,
            type: sp?.type || "FIFTY_KG",
            price: parseApiDecimal(sp?.price),
            stock: parseApiDecimal(sp?.stock),
            profit: sp?.profit ? parseApiDecimal(sp.profit) : undefined,
            specialPrice: sp?.specialPrice
              ? {
                  id: sp.specialPrice?.id,
                  price: parseApiDecimal(sp.specialPrice?.price),
                  minimumQty: sp.specialPrice?.minimumQty || 0,
                  profit: sp.specialPrice?.profit
                    ? parseApiDecimal(sp.specialPrice.profit)
                    : undefined,
                }
              : null,
          }))
        );

        // Handle per kilo price with proper decimal parsing
        if (fetchedProduct.perKiloPrice) {
          setPerKiloPrice({
            id: fetchedProduct.perKiloPrice.id,
            price: parseApiDecimal(fetchedProduct.perKiloPrice.price),
            stock: parseApiDecimal(fetchedProduct.perKiloPrice.stock),
            profit: fetchedProduct.perKiloPrice.profit
              ? parseApiDecimal(fetchedProduct.perKiloPrice.profit)
              : undefined,
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
      const validation = validateProductImage(file);

      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }

      // Show file info in success message
      if (validation.fileInfo) {
        toast({
          title: "File selected",
          description: `${validation.fileInfo.name} (${validation.fileInfo.sizeInMB}MB) ready for upload`,
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
    const hasPerKiloPrice =
      perKiloPrice && perKiloPrice.price > 0 && perKiloPrice.stock >= 0;

    if (!hasSackPrices && !hasPerKiloPrice) {
      newErrors.pricing =
        "At least one pricing option (sack prices or per kilo price) is required";
    }

    sackPrices.forEach((sack, index) => {
      if (!sack.price || sack.price <= 0)
        newErrors[`sackPrice_${index}_price`] = "Price must be greater than 0";
      if (sack.stock === undefined || sack.stock === null || sack.stock < 0)
        newErrors[`sackPrice_${index}_stock`] = "Stock must be 0 or greater";

      if (
        sack.specialPrice?.price &&
        sack.specialPrice.price > 0 &&
        !sack.specialPrice?.minimumQty
      ) {
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

      // Process sack prices with proper decimal handling
      const sackPricesData = sackPrices.map((sp) => ({
        id: sp.id,
        price: sp.price ? CurrencyCalculator.round(sp.price) : 0,
        stock: sp.stock || 0,
        type: sp.type,
        profit:
          sp.profit !== undefined
            ? CurrencyCalculator.round(sp.profit)
            : undefined,
        specialPrice: sp.specialPrice
          ? {
              id: sp.specialPrice.id,
              price: sp.specialPrice.price
                ? CurrencyCalculator.round(sp.specialPrice.price)
                : 0,
              minimumQty: sp.specialPrice.minimumQty || 0,
              profit:
                sp.specialPrice.profit !== undefined
                  ? CurrencyCalculator.round(sp.specialPrice.profit)
                  : undefined,
            }
          : null,
      }));

      formData.append("sackPrice", JSON.stringify(sackPricesData));

      // Send deleted IDs separately
      if (deletedSackPriceIds.length > 0) {
        formData.append(
          "deletedSackPriceIds",
          JSON.stringify(deletedSackPriceIds)
        );
      }

      if (deletedSpecialPriceIds.length > 0) {
        formData.append(
          "deletedSpecialPriceIds",
          JSON.stringify(deletedSpecialPriceIds)
        );
      }

      if (perKiloPrice) {
        formData.append(
          "perKiloPrice",
          JSON.stringify({
            id: perKiloPrice.id,
            price: perKiloPrice.price
              ? CurrencyCalculator.round(perKiloPrice.price)
              : 0,
            stock: perKiloPrice.stock || 0,
            profit:
              perKiloPrice.profit !== undefined
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

  // Helper function to safely update per kilo price
  const updatePerKiloPrice = (field: string, value: string) => {
    setPerKiloPrice((prev) => {
      const basePrice = prev || { price: 0, stock: 0 };

      if (field === "price" || field === "stock") {
        const numValue = parseFloat(value) || 0;
        return { ...basePrice, [field]: numValue };
      } else if (field === "profit") {
        if (value === "") {
          return { ...basePrice, profit: undefined };
        } else {
          const numValue = parseFloat(value);
          return {
            ...basePrice,
            profit: !isNaN(numValue)
              ? CurrencyCalculator.round(numValue)
              : undefined,
          };
        }
      }

      return basePrice;
    });
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
                  accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,.avif,.heic,.heif,.bmp,.gif,image/jpeg,image/png,image/webp,image/tiff,image/avif,image/heic,image/heif,image/bmp,image/gif"
                  onChange={handleFileChange}
                  className="focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP, HEIC/HEIF, TIFF, AVIF,
                  BMP, GIF. Maximum size: 15MB
                </p>
              </div>

              <Separator />

              {/* Sack Prices Manager */}
              <SackPricesManager
                sackPrices={sackPrices}
                setSackPrices={setSackPrices}
                errors={errors}
                deletedSackPriceIds={deletedSackPriceIds}
                setDeletedSackPriceIds={setDeletedSackPriceIds}
                deletedSpecialPriceIds={deletedSpecialPriceIds}
                setDeletedSpecialPriceIds={setDeletedSpecialPriceIds}
              />

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
                      value={formatDecimalForInput(perKiloPrice?.price)}
                      onChange={(e) =>
                        updatePerKiloPrice("price", e.target.value)
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
                      value={formatDecimalForInput(perKiloPrice?.stock)}
                      onChange={(e) =>
                        updatePerKiloPrice("stock", e.target.value)
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
                      value={formatDecimalForInput(perKiloPrice?.profit)}
                      onChange={(e) =>
                        updatePerKiloPrice("profit", e.target.value)
                      }
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
