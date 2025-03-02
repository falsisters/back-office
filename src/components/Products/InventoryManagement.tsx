"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CreateProduct } from "@/components/Products/CreateProduct";
import { ItemTable } from "@/components/Products/ItemTable";
import type { Product, Price } from "../../../utils/types/schema.type";
import { getAllProductsByUserId } from "@/lib/server/getAllProductsByUserId";
import { editProduct } from "@/lib/server/editProduct";
import { deleteProduct } from "@/lib/server/deleteProduct";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Price?.some((p) =>
        p.type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleUpdateProduct = async (
    updatedProduct: Product & { Price?: Price[] }
  ) => {
    try {
      setIsLoading(true);
      const updated = await editProduct(updatedProduct.id, {
        product: {
          name: updatedProduct.name,
          price:
            updatedProduct.Price?.map((price) => ({
              id: price.id,
              price: price.price,
              stock: price.stock,
              type: price.type,
              profit: price.profit?.map((p) => ({ profit: p.profit })) || [],
              specialPrice:
                price.specialPrice?.map((sp) => ({
                  specialPrice: sp.specialPrice,
                  minimumQty: sp.minimumQty,
                })) || [],
            })) || [],
        },
      });
      setProducts(
        products.map((product) =>
          product.id === updated.id ? updated : product
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="p-8 rounded-lg flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-800" />
          <p className="mt-4 text-lg font-semibold text-gray-800">
            Loading products...
          </p>
        </div>
      </div>
    );
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
        <CreateProduct
          onProductCreated={(product) => {
            setProducts((prevProducts) => [...prevProducts, product]);
          }}
        />
      </div>
      <ItemTable
        isLoading={isLoading}
        items={filteredProducts}
        onUpdateItem={handleUpdateProduct}
        onDeleteItem={handleDeleteProduct}
      />
    </div>
  );
}
