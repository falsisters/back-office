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
import { editProduct } from '@/lib/server/editProduct';
import { useToast } from '@/hooks/use-toast';
import { PerKiloPrice } from '../../../utils/types/schema.type';

interface PerKiloPriceEditorProps {
  productId: string;
  currentPerKiloPrice: PerKiloPrice;
  onPriceUpdated?: () => void;
}

const PerKiloPriceEditor: React.FC<PerKiloPriceEditorProps> = ({ 
  productId, 
  currentPerKiloPrice, 
  onPriceUpdated 
}) => {
  const { toast } = useToast();
  const [price, setPrice] = useState(currentPerKiloPrice.price);
  const [stock, setStock] = useState(currentPerKiloPrice.stock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('perKiloPrice', JSON.stringify({
        id: currentPerKiloPrice.id,
        price,
        stock
      }));

      await editProduct(productId, formData);
      
      toast({
        title: "Price Updated",
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit Per Kilo Price</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Per Kilo Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Price per Kilo</Label>
            <Input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required 
            />
          </div>
          
          <div>
            <Label>Stock</Label>
            <Input 
              type="number" 
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required 
            />
          </div>

          <Button type="submit">Update Price</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PerKiloPriceEditor;