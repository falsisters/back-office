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
import { editProduct } from '@/lib/server/editProduct';
import { useToast } from '@/hooks/use-toast';
import { SackTypeEnum } from '../../../utils/types/schema.type';
import { z } from 'zod';

interface SackPriceVariantEditorProps {
  productId: string;
  currentSackPrices: Array<{
    id: string;
    type: z.infer<typeof SackTypeEnum>;
    price: number;
    stock: number;
    specialPrice?: {
      price?: number;
      minimumQty?: number;
    };
  }>;
  onPriceUpdated?: () => void;
}

const SackPriceVariantEditor: React.FC<SackPriceVariantEditorProps> = ({ 
  productId, 
  currentSackPrices, 
  onPriceUpdated 
}) => {
  const { toast } = useToast()
  const [sackPrices, setSackPrices] = useState(currentSackPrices);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('sackPrices', JSON.stringify(
        sackPrices.map(sp => ({
          id: sp.id,
          type: sp.type,
          price: sp.price,
          stock: sp.stock,
          specialPrice: sp.specialPrice
        }))
      ));

      await editProduct(productId, formData);
      
      toast({
        title: "Sack Prices Updated",
      });

      onPriceUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive"
      });
      console.error("Error: ", error)
    }
  };

  const updateSackPrice = (index: number, field: keyof typeof sackPrices[0], value: unknown) => {
    const newSackPrices = [...sackPrices];
    newSackPrices[index] = {
      ...newSackPrices[index],
      [field]: value
    };
    setSackPrices(newSackPrices);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit Sack Prices</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sack Price Variants</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {sackPrices.map((sackPrice, index) => (
            <div key={sackPrice.id} className="space-y-2 p-4 border rounded-md">
              <div>
                <Label>Sack Type</Label>
                <Select 
                  value={sackPrice.type}
                  onValueChange={(value) => updateSackPrice(index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sack Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SackTypeEnum.enum).map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Price</Label>
                <Input 
                  type="number" 
                  value={sackPrice.price}
                  onChange={(e) => updateSackPrice(index, 'price', Number(e.target.value))}
                  required 
                />
              </div>
              
              <div>
                <Label>Stock</Label>
                <Input 
                  type="number" 
                  value={sackPrice.stock}
                  onChange={(e) => updateSackPrice(index, 'stock', Number(e.target.value))}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Special Price (Optional)</Label>
                <div className="flex space-x-2">
                  <Input 
                    type="number" 
                    placeholder="Special Price" 
                    value={sackPrice.specialPrice?.price || ''}
                    onChange={(e) => {
                      const specialPrice = { 
                        ...sackPrice.specialPrice, 
                        price: Number(e.target.value) 
                      };
                      updateSackPrice(index, 'specialPrice', specialPrice);
                    }}
                  />
                  <Input 
                    type="number" 
                    placeholder="Minimum Quantity" 
                    value={sackPrice.specialPrice?.minimumQty || ''}
                    onChange={(e) => {
                      const specialPrice = { 
                        ...sackPrice.specialPrice, 
                        minimumQty: Number(e.target.value) 
                      };
                      updateSackPrice(index, 'specialPrice', specialPrice);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="submit">Update Sack Prices</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SackPriceVariantEditor;