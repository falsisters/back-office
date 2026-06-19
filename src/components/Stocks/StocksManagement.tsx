"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockStats } from "@/hooks/useStocks";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { ProductResponse } from "../../../utils/types/Products/getAllProductsByUserId.type";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import StocksTable from "./StocksTable";
import StockSummary from "./StocksSummary";
import TransferHistory from "./TransferHistory";
import { CashierSelector } from "../Cashier/CashierSelector";

export default function StocksManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"stocks" | "transfers">("stocks");
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );

  const {
    data: stockData = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useStockStats();

  const products = useMemo(() => {
    if (!selectedCashierId) return [];
    if (!Array.isArray(stockData)) return [];
    if (stockData.length > 0 && "SackPrice" in stockData[0]) {
      return (stockData as ProductResponse[]).filter(
        (p) => (p as any).cashierId === selectedCashierId
      );
    }
    return stockData.filter(
      (p: any) => p.cashierId === selectedCashierId
    ) as ProductResponse[];
  }, [stockData, selectedCashierId]);

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

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleCashierSelect = (cashierId: string) => {
    setSelectedCashierId(cashierId);
    setSearchTerm("");
  };

  return (
    <>
      <div className="mb-6 flex gap-2">
        <Button
          variant={activeTab === "stocks" ? "default" : "outline"}
          onClick={() => setActiveTab("stocks")}
          className="min-w-[120px]"
        >
          Stock Management
        </Button>
        <Button
          variant={activeTab === "transfers" ? "default" : "outline"}
          onClick={() => setActiveTab("transfers")}
          className="min-w-[120px]"
        >
          Transfer History
        </Button>
      </div>

      {activeTab === "stocks" ? (
        <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-3xl font-bold text-primary">
              Stock Management
            </CardTitle>
            <Button
              variant="outline"
              size="default"
              onClick={handleProductUpdate}
              disabled={isRefetching || !selectedCashierId}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <RefreshCw
                size={18}
                className={isRefetching ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 px-6">
            <CashierSelector
              selectedCashierId={selectedCashierId}
              onCashierSelect={handleCashierSelect}
            />

            {selectedCashierId && (
              <>
                <div className="flex items-center gap-4">
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={handleClearSearch}
                      >
                        <span className="sr-only">Clear search</span>×
                      </Button>
                    )}
                  </div>
                  <div className="text-base text-muted-foreground">
                    {filteredProducts.length} of {products.length} items
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">
                      Loading stock data...
                    </p>
                  </div>
                ) : filteredProducts.length === 0 && searchTerm ? (
                  <div className="text-center py-12 border border-dashed rounded-md">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">
                      No products found matching &quot;{searchTerm}&quot;
                    </p>
                    <Button
                      variant="link"
                      onClick={handleClearSearch}
                      className="mt-4 text-base"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : filteredProducts.length === 0 && !isLoading ? (
                  <div className="text-center py-12 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground mb-2 text-lg">
                      No products found
                    </p>
                    <p className="text-muted-foreground">
                      No stock data available for selected cashier
                    </p>
                  </div>
                ) : (
                  <>
                    <StocksTable products={filteredProducts} />
                    <StockSummary products={filteredProducts} />
                  </>
                )}
              </>
            )}

            {!selectedCashierId && (
              <div className="text-center py-12 border border-dashed rounded-md bg-muted/20">
                <p className="text-muted-foreground mb-2">
                  Select a cashier to view stock information
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a cashier from the dropdown above to view their stock
                  data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <TransferHistory selectedCashierId={selectedCashierId} />
      )}
    </>
  );
}
