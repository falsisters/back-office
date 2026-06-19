"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductsByCashier } from "@/hooks/useProducts";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import CreateProduct from "./CreateProduct";
import ItemTable from "./ItemTable";
import PriceSummary from "./PriceSummary";
import UnassignedProductsManager from "./UnassignedProductsManager";
import { CashierSelector } from "../Cashier/CashierSelector";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );

  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useProductsByCashier(selectedCashierId);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  useEffect(() => {
    if (isError && error) {
      toast.error(extractNestError(error));
    }
  }, [isError, error]);

  const handleProductUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCashierSelect = (cashierId: string) => {
    setSelectedCashierId(cashierId);
    setSearchTerm("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-2xl font-bold text-primary">
          Inventory Management
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching || !selectedCashierId}
          className="gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <RefreshCw
            size={16}
            className={isRefetching ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <UnassignedProductsManager onProductsUpdated={handleProductUpdate} />

        <CashierSelector
          selectedCashierId={selectedCashierId}
          onCashierSelect={handleCashierSelect}
        />

        {selectedCashierId && (
          <>
            <CreateProduct
              selectedCashierId={selectedCashierId}
              onProductCreated={handleProductUpdate}
            />

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="Search products by name..."
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={handleClearSearch}
                  >
                    <span className="sr-only">Clear search</span>×
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} of {products.length} items
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading inventory data...
                </p>
              </div>
            ) : isError ? (
              <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-center">
                <p className="text-sm text-destructive font-medium">
                  Failed to load products
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-2 border-primary/30 text-primary hover:bg-primary/10"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {filteredProducts.length === 0 && searchTerm ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                    <p className="text-muted-foreground">
                      No products found matching &quot;{searchTerm}&quot;
                    </p>
                    <Button
                      variant="link"
                      onClick={handleClearSearch}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <ItemTable
                    products={filteredProducts}
                    onProductUpdate={handleProductUpdate}
                  />
                )}
                <PriceSummary products={filteredProducts} />
              </>
            )}
          </>
        )}

        {!selectedCashierId && (
          <div className="text-center py-12 border border-dashed rounded-md bg-muted/20">
            <p className="text-muted-foreground mb-2">
              Select a cashier to manage products
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a cashier from the dropdown above to view and manage
              their products
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
