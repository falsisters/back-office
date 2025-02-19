"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { AddItemDialog } from "@/components/AddItem";
import { ItemTable } from "@/components/ItemTable";
import type { Product, Price } from "../../utils/types/schema.type";
import { getAllProductsByUserId } from "@/lib/server/getAllProductsByUserId";
import { createProduct } from "@/lib/server/createProduct";
import { editProduct } from "@/lib/server/editProduct";
import { deleteProduct } from "@/lib/server/deleteProduct";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import type { CreateProductFormData } from "../../utils/types/createProduct.type";

export function InventoryManagement() {
  const [products, setProducts] = useState<(Product & { prices?: Price[] })[]>(
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
      product.prices?.some((p) =>
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleAddProduct = async (newProduct: Omit<Product, "id" | "createdAt" | "updatedAt" | "userId">) => {
    try {
      const trimmedName = newProduct.name.trim();
      
      if (!trimmedName) {
        setError("Product name cannot be empty");
        return;
      }

      const requestData = {
        name: trimmedName,
        minimumQty: Number(newProduct.minimumQty),
        price: [] 
      };
  
      console.log('Sending product data:', JSON.stringify(requestData, null, 2));
      
      const createdProduct = await createProduct({
        product: requestData
      });
      setProducts((prevProducts) => [...prevProducts, createdProduct]);
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  const handleAddProductPrice = async (
    productId: string,
    newPrice: Omit<Price, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const productToUpdate = products.find((p) => p.id === productId);
      if (!productToUpdate) throw new Error("Product not found");

      const formData: CreateProductFormData = {
        product: {
          name: productToUpdate.name,
          minimumQty: productToUpdate.minimumQty,
          price: [
            ...(productToUpdate.prices || []).map((p) => ({
              price: p.price,
              type: p.type,
              stock: p.stock,
              profit: [],
            })),
            {
              price: newPrice.price,
              type: newPrice.type,
              stock: newPrice.stock,
              profit: [],
            },
          ],
        },
      };

      const updatedProduct = await editProduct(productId, formData);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? updatedProduct : product
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add product price"
      );
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const updated = await editProduct(updatedProduct.id, {
        product: updatedProduct,
      });
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
        <AddItemDialog onAddItem={handleAddProduct} />
      </div>
      <ItemTable
        items={filteredProducts}
        onUpdateItem={handleUpdateProduct}
        onDeleteItem={handleDeleteProduct}
        onAddPrice={handleAddProductPrice}
      />
    </div>
  );
}
