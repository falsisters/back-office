"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CreditCard, Banknote, BanknoteIcon } from 'lucide-react';

export default function SaleItem({ 
  productName, 
  items, 
  allSales 
}: { 
  productName: string; 
  items: GetAllSalesByUserIdPayload[number]['SaleItem']; 
  allSales: GetAllSalesByUserIdPayload;
}) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  let totalAmount = 0;
  let checkTotal = 0;
  let bankTransferTotal = 0;
  
  items.forEach(item => {
    const sale = allSales.find(s => s.id === item.saleId);
    if (!sale) return;
    
    const price = item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
      ? item.product.SackPrice[0]?.specialPrice?.price
      : (item.product.SackPrice[0]?.price || item.product.perKiloPrice?.price || 0);
    
    const itemTotal = price * item.quantity;
    totalAmount += itemTotal;
    
    if (sale.paymentMethod === 'CHECK') {
      checkTotal += itemTotal;
    } else if (sale.paymentMethod === 'BANK_TRANSFER') {
      bankTransferTotal += itemTotal;
    }
  });
  
  const cashTotal = totalAmount - checkTotal - bankTransferTotal;

  return (
    <Card className="shadow-md border-l-4 border-l-primary overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShoppingBag className="h-5 w-5" />
          {productName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-medium">Item Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => {
                const sale = allSales.find(s => s.id === item.saleId);
                const price = item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
                  ? item.product.SackPrice[0]?.specialPrice?.price
                  : (item.product.SackPrice[0]?.price || item.product.perKiloPrice?.price || 0);
                const totalPrice = Math.floor(price * item.quantity);
                const paymentMethod = sale?.paymentMethod || 'CASH';
                const specialPriceInfo = item.isSpecialPrice ? ' (special price)' : '';
                const gantangInfo = item.isGantang ? ' (gantang)' : '';
                
                return (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.quantity} {productName}</span>
                          {gantangInfo && <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20">{gantangInfo}</Badge>}
                          {specialPriceInfo && <Badge variant="outline" className="ml-2 bg-secondary/10 text-secondary border-secondary/20">{specialPriceInfo}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-secondary">₱{totalPrice}</span>
                          {paymentMethod !== 'CASH' && (
                            <Badge variant="outline" className="bg-muted/50">
                              {paymentMethod.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Sale Summary</h3>
            <Separator className="my-2 bg-primary/20" />
            
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Total Quantity:
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-primary text-primary-foreground">{totalQuantity}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium flex items-center gap-2">
                    <BanknoteIcon className="h-4 w-4 text-secondary" />
                    Total Amount:
                  </TableCell>
                  <TableCell className="text-right font-semibold text-secondary">₱{Math.floor(totalAmount)}</TableCell>
                </TableRow>
                
                {checkTotal > 0 && (
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      CHECK Deduction:
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">- ₱{Math.floor(checkTotal)}</TableCell>
                  </TableRow>
                )}
                
                {bankTransferTotal > 0 && (
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      BANK TRANSFER Deduction:
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">- ₱{Math.floor(bankTransferTotal)}</TableCell>
                  </TableRow>
                )}
                
                <TableRow className="border-t-2 border-t-primary/20">
                  <TableCell className="font-bold text-primary">NET TOTAL (CASH):</TableCell>
                  <TableCell className="text-right font-bold text-secondary">₱{Math.floor(cashTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
