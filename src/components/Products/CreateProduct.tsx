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
import { SackType } from '../../../utils/types/schema.type';
import { useToast } from '@/hooks/use-toast';

interface CreateProductProps {
  onProductCreated: (newProduct: unknown) => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({ onProductCreated }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [picture, setPicture] = useState<File | null>(null);
  const [sackPrices, setSackPrices] = useState<Array<{
    type: SackType;
    price: number;
    stock: number;
    specialPrice?: {
      price: number;
      minimumQty: number;
    };
  }>>([]);
  const [perKiloPrice, setPerKiloPrice] = useState<{ price: number; stock: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const formData = new FormData();
      if (picture) formData.append('picture', picture);
      formData.append('name', name);
      formData.append('sackPrice', JSON.stringify(sackPrices));
      if (perKiloPrice) formData.append('perKiloPrice', JSON.stringify(perKiloPrice));
  
      const newProduct = await createProduct(formData);
      onProductCreated(newProduct); // Add new product to the UI
  
      toast({ title: "Product Created Successfully" });
  
      // Reset the form fields
      setName('');
      setPicture(null);
      setSackPrices([]);
      setPerKiloPrice(null);
    } catch (error) {
      toast({
        title: "Error Creating Product",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isSubmitting}>Create Product</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Product Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPicture(e.target.files?.[0] || null)} required />
          </div>

          <div className="space-y-4">
            <Label>Sack Prices</Label>
            {sackPrices.map((sack, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-lg">
                <Label>Type</Label>
                <Select value={sack.type} onValueChange={(value) => {
                  const newSackPrices = [...sackPrices];
                  newSackPrices[index].type = value as SackType;
                  setSackPrices(newSackPrices);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sack Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFTY_KG">50 KG</SelectItem>
                    <SelectItem value="TWENTY_FIVE_KG">25 KG</SelectItem>
                    <SelectItem value="FIVE_KG">5 KG</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Price</Label>
                <Input type="number" placeholder="Price" value={sack.price || ''} onChange={(e) => {
                  const newSackPrices = [...sackPrices];
                  newSackPrices[index].price = Number(e.target.value);
                  setSackPrices(newSackPrices);
                }} min="0" step="0.01" />

                <Label>Stock</Label>
                <Input type="number" placeholder="Stock" value={sack.stock || ''} onChange={(e) => {
                  const newSackPrices = [...sackPrices];
                  newSackPrices[index].stock = Number(e.target.value);
                  setSackPrices(newSackPrices);
                }} min="0" />

                <Label className="text-sm text-muted-foreground">Special Price (Optional)</Label>
                <Input type="number" placeholder="Special Price" value={sack.specialPrice?.price || ''} onChange={(e) => {
                  const newSackPrices = [...sackPrices];
                  if (!newSackPrices[index].specialPrice) newSackPrices[index].specialPrice = { price: 0, minimumQty: 0 };
                  newSackPrices[index].specialPrice!.price = Number(e.target.value);
                  setSackPrices(newSackPrices);
                }} min="0" step="0.01" />

                <Input type="number" placeholder="Minimum Quantity" value={sack.specialPrice?.minimumQty || ''} onChange={(e) => {
                  const newSackPrices = [...sackPrices];
                  if (!newSackPrices[index].specialPrice) newSackPrices[index].specialPrice = { price: 0, minimumQty: 0 };
                  newSackPrices[index].specialPrice!.minimumQty = Number(e.target.value);
                  setSackPrices(newSackPrices);
                }} min="0" />
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={() => setSackPrices([...sackPrices, { type: 'FIFTY_KG', price: 0, stock: 0 }])}>
              Add Sack Price
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Per Kilo Price (Optional)</Label>
            <Input type="number" placeholder="Price per Kilo" value={perKiloPrice?.price || ''} onChange={(e) => setPerKiloPrice({
              ...(perKiloPrice || { price: 0, stock: 0 }),
              price: Number(e.target.value)
            })} min="0" step="0.01" />

            <Label>Stock</Label>
            <Input type="number" placeholder="Stock" value={perKiloPrice?.stock || ''} onChange={(e) => setPerKiloPrice({
              ...(perKiloPrice || { price: 0, stock: 0 }),
              stock: Number(e.target.value)
            })} min="0" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProduct;
