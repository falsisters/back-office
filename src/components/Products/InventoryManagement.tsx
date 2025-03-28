"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllProducts } from "@/lib/server/getAllProductsByUserId";
import { ProductResponse } from "../../../utils/types/getAllProductsByUserId.type";
import CreateProduct from "./CreateProduct";
import ItemTable from "./ItemTable";
import { PriceSummary } from "./PriceSummary";
import { Toaster } from "@/components/ui/toaster";

const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllProducts();
      if (result.data) {
        setProducts(result.data);
        setError(null);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductUpdate = () => {
    fetchProducts();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateProduct onProductCreated={handleProductUpdate} />
          <ItemTable 
            products={products} 
            onProductUpdate={handleProductUpdate} 
          />
          <PriceSummary products={products} />
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default InventoryManagement;
