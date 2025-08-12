"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUnassignedProducts } from "@/lib/server/Products/getUnassignedProducts";
import { getAllCashiersByUserId } from "@/lib/server/Cashier/getAllCashiersByUserId";
import { assignCashierToProduct } from "@/lib/server/Products/assignCashierToProduct";
import { useToast } from "@/hooks/use-toast";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/Cashier/getAllCashiersByUserId.type";
import { AlertTriangle, Users, Package } from "lucide-react";
import Image from "next/image";
import { CurrencyCalculator } from "../../../utils/currencyCalculator";

interface UnassignedProductsManagerProps {
  onProductsUpdated: () => void;
}

export default function UnassignedProductsManager({
  onProductsUpdated,
}: UnassignedProductsManagerProps) {
  const { toast } = useToast();
  const [unassignedProducts, setUnassignedProducts] = useState<
    ProductResponse[]
  >([]);
  const [cashiers, setCashiers] = useState<GetAllCashiersByUserIdPayload>([]);
  const [selectedCashiers, setSelectedCashiers] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<Set<string>>(new Set());

  // Helper function to safely parse price values from API
  const parseApiPrice = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "string") return parseFloat(value) || 0;
    if (typeof value === "number") return value;
    return 0;
  };

  // Helper function to format currency display
  const formatCurrency = (value: any): string => {
    const numValue = parseApiPrice(value);
    return CurrencyCalculator.round(numValue).toFixed(2);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResult, cashiersResult] = await Promise.all([
          getUnassignedProducts(),
          getAllCashiersByUserId(),
        ]);

        if (productsResult.data) {
          setUnassignedProducts(productsResult.data);
        }
        setCashiers(cashiersResult);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load unassigned products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleAssignCashier = async (productId: string) => {
    const cashierId = selectedCashiers[productId];
    if (!cashierId) {
      toast({
        title: "No cashier selected",
        description: "Please select a cashier for this product",
        variant: "destructive",
      });
      return;
    }

    setAssigning((prev) => new Set(prev).add(productId));
    try {
      await assignCashierToProduct(productId, cashierId);
      setUnassignedProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedCashiers((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      onProductsUpdated();
      toast({
        title: "Cashier assigned successfully",
        description: "Product has been assigned to the selected cashier",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign cashier",
        variant: "destructive",
      });
    } finally {
      setAssigning((prev) => {
        const updated = new Set(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-amber-700">
              Loading unassigned products...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (unassignedProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50 mb-6">
      <CardHeader className="bg-amber-100">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Migration Required - Unassigned Products
          <Badge
            variant="outline"
            className="bg-amber-200 text-amber-800 border-amber-300"
          >
            {unassignedProducts.length} products
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-amber-700 mb-4 text-sm">
          The following products need to be assigned to a cashier. Please select
          a cashier for each product to complete the migration.
        </p>

        <div className="space-y-4">
          {unassignedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-white rounded-lg border border-amber-200"
            >
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border">
                <Image
                  src={product.picture || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {product.SackPrice.length} sack price
                    {product.SackPrice.length !== 1 ? "s" : ""}
                    {product.perKiloPrice && ", Per kilo pricing"}
                  </span>
                </div>
                {/* Show pricing preview */}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  {product.SackPrice.length > 0 && (
                    <span>
                      Sack: ₱{formatCurrency(product.SackPrice[0]?.price)}
                    </span>
                  )}
                  {product.perKiloPrice && (
                    <span>
                      Per kg: ₱{formatCurrency(product.perKiloPrice.price)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={selectedCashiers[product.id] || ""}
                  onValueChange={(value) =>
                    setSelectedCashiers((prev) => ({
                      ...prev,
                      [product.id]: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select cashier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cashiers.map((cashier) => (
                      <SelectItem key={cashier.id} value={cashier.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {cashier.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => handleAssignCashier(product.id)}
                  disabled={
                    !selectedCashiers[product.id] || assigning.has(product.id)
                  }
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {assigning.has(product.id) ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
