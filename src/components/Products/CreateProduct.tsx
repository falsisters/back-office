import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createProduct } from '@/lib/server/createProduct';
import { SackTypeEnum } from '../../../utils/types/schema.type';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

interface CreateProductProps {
  onProductCreated: () => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({ onProductCreated }) => {
  const { toast } = useToast()
  const [name, setName] = useState('');
  const [picture, setPicture] = useState<File | null>(null);
  const [sackPrices, setSackPrices] = useState<Array<{
    type: z.infer<typeof SackTypeEnum>;
    price: number;
    stock: number;
    specialPrice: {
      price: number;
      minimumQty: number;
    };
  }>>([]);
  const [perKiloPrice, setPerKiloPrice] = useState({
    price: 0,
    stock: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create FormData for picture
      const formData = new FormData();
      if (picture) formData.append('picture', picture);
  
      // Prepare the product data object
      const productData = {
        name,
        sackPrice: sackPrices.map(sack => ({
          price: sack.price,
          stock: sack.stock,
          type: sack.type,
          specialPrice: {
            price: sack.specialPrice.price,
            minimumQty: sack.specialPrice.minimumQty
          }
        })),
        perKiloPrice: perKiloPrice.price > 0 || perKiloPrice.stock > 0 
          ? { price: perKiloPrice.price, stock: perKiloPrice.stock } 
          : undefined
      };
  
      // Call createProduct with both formData and productData
      const result = await createProduct(formData, productData);
  
      console.log("Created Product: ", result)
      onProductCreated();
      toast({ title: "Product Created" });
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Product</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <Label>Product Image</Label>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPicture(e.target.files?.[0] || null)} 
              required 
            />
          </div>

          {/* Sack Prices Section */}
          <div className="space-y-4">
            <Label>Sack Prices</Label>
            {sackPrices.map((sackPrice, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-lg">
                <div className="flex gap-2">
                  <Select 
                    value={sackPrice.type}
                    onValueChange={(value) => {
                      const newSackPrices = [...sackPrices];
                      newSackPrices[index].type = value as z.infer<typeof SackTypeEnum>;
                      setSackPrices(newSackPrices);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sack Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SackTypeEnum.enum).map((type) => (
                        <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Price" 
                    value={sackPrice.price}
                    onChange={(e) => {
                      const newSackPrices = [...sackPrices];
                      newSackPrices[index].price = Number(e.target.value);
                      setSackPrices(newSackPrices);
                    }}
                  />
                  <Input 
                    type="number" 
                    placeholder="Stock" 
                    value={sackPrice.stock}
                    onChange={(e) => {
                      const newSackPrices = [...sackPrices];
                      newSackPrices[index].stock = Number(e.target.value);
                      setSackPrices(newSackPrices);
                    }}
                  />
                </div>
                
                {/* Special Price Inputs */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Special Price</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Special Price"
                      value={sackPrice.specialPrice.price}
                      onChange={(e) => {
                        const newSackPrices = [...sackPrices];
                        newSackPrices[index].specialPrice.price = Number(e.target.value);
                        setSackPrices(newSackPrices);
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Minimum Quantity"
                      value={sackPrice.specialPrice.minimumQty}
                      onChange={(e) => {
                        const newSackPrices = [...sackPrices];
                        newSackPrices[index].specialPrice.minimumQty = Number(e.target.value);
                        setSackPrices(newSackPrices);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              onClick={() => setSackPrices([...sackPrices, { 
                type: 'FIFTY_KG', 
                price: 0, 
                stock: 0,
                specialPrice: {
                  price: 0,
                  minimumQty: 0
                }
              }])}
            >
              Add Sack Price
            </Button>
          </div>

          {/* Per Kilo Price Section */}
          <div className="space-y-2">
            <Label>Per Kilo Price</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Price per Kilo" 
                value={perKiloPrice.price}
                onChange={(e) => setPerKiloPrice({
                  ...perKiloPrice, 
                  price: Number(e.target.value)
                })}
              />
              <Input 
                type="number" 
                placeholder="Stock" 
                value={perKiloPrice.stock}
                onChange={(e) => setPerKiloPrice({
                  ...perKiloPrice, 
                  stock: Number(e.target.value)
                })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">Create Product</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProduct;