"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import CreateProduct from "@/components/CreateProduct";
import { ItemTable } from "@/components/ItemTable";
import type { Product, Price } from "../../utils/types/schema.type";
import { getAllProductsByUserId } from "@/lib/server/getAllProductsByUserId";
import { editProduct } from "@/lib/server/editProduct";
import { deleteProduct } from "@/lib/server/deleteProduct";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import type { EditProductFormData } from "../../utils/types/editProduct.type";

export function InventoryManagement() {
  const [products, setProducts] = useState<(Product & { Price?: Price[] })[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProductsByUserId();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Price?.some((p) =>
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleUpdateProduct = async (updatedProduct: Product & { Price?: Price[] }) => {
    try {
      const productData: EditProductFormData = {
        product: {
          name: updatedProduct.name,
          price: updatedProduct.Price?.map(p => ({
            price: p.price,
            stock: p.stock,
            type: p.type,
            profit: p.Profit?.map((pr: { profit: unknown; }) => ({ profit: pr.profit })) || [],
            specialPrice: p.SpecialPrice?.map((sp: { specialPrice: unknown; minimumQty: unknown; }) => ({ 
              specialPrice: sp.specialPrice, 
              minimumQty: sp.minimumQty 
            })) || []
          })) || []
        }
      };
      
      const updated = await editProduct(updatedProduct.id, productData);
      setProducts(
        products.map((product) =>
          product.id === updated.id ? updated : product
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <CreateProduct onProductCreated={(product) => {
          setProducts((prevProducts) => [...prevProducts, product]);
        }} />
      </div>
      <ItemTable
        items={filteredProducts}
        onUpdateItem={handleUpdateProduct}
        onDeleteItem={handleDeleteProduct}
      />
    </div>
  );
}