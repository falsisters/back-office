import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { ProductResponse } from '../../../utils/types/getAllProductsByUserId.type';

interface BasicProductInfoProps {
  product: ProductResponse
}

const BasicProductInfo: React.FC<BasicProductInfoProps> = ({ product }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="relative w-full h-48">
            <Image 
              src={product.picture} 
              alt={product.name} 
              fill 
              className="object-cover rounded-md"
            />
          </div>
          
          <div>
            <h3 className="font-semibold">Sack Prices</h3>
            {product.SackPrice.map((sackPrice) => (
              <div key={sackPrice.id} className="flex justify-between">
                <span>{sackPrice.type}</span>
                <span>₱{sackPrice.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          {product.perKiloPrice.length > 0 && (
            <div>
              <h3 className="font-semibold">Per Kilo Price</h3>
              {product.perKiloPrice.map((kiloPrice) => (
                <div key={kiloPrice.id} className="flex justify-between">
                  <span>Price per Kilo</span>
                  <span>₱{kiloPrice.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicProductInfo;