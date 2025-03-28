import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductResponse } from '../../../utils/types/getAllProductsByUserId.type';

interface PriceSummaryProps {
  products: ProductResponse[];
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ products }) => {
  const calculateTotalInventoryValue = () => {
    return products.reduce((total, product) => {
      // Safe calculation for sack prices
      const sackPriceValue = Array.isArray(product.SackPrice) 
        ? product.SackPrice.reduce(
            (sackTotal, sackPrice) => sackTotal + (sackPrice.price * sackPrice.stock),
            0
          )
        : 0;
      
      // Safe calculation for per kilo prices
      const perKiloValue = Array.isArray(product.perKiloPrice)
        ? product.perKiloPrice.reduce(
            (kiloTotal, kiloPrice) => kiloTotal + (kiloPrice.price * kiloPrice.stock),
            0
          )
        : 0;
      
      return total + sackPriceValue + perKiloValue;
    }, 0);
  };

  const calculateTotalStock = () => {
    return products.reduce((total, product) => {
      // Safe calculation for sack stock
      const sackStock = Array.isArray(product.SackPrice)
        ? product.SackPrice.reduce(
            (sackTotal, sackPrice) => sackTotal + sackPrice.stock,
            0
          )
        : 0;
      
      // Safe calculation for kilo stock  
      const kiloStock = Array.isArray(product.perKiloPrice)
        ? product.perKiloPrice.reduce(
            (kiloTotal, kiloPrice) => kiloTotal + kiloPrice.stock,
            0
          )
        : 0;
      
      return total + sackStock + kiloStock;
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Products:</span>
            <span>{products.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Inventory Value:</span>
            <span>₱{calculateTotalInventoryValue().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Stock Quantity:</span>
            <span>{calculateTotalStock()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSummary;