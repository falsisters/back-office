"use client";

import { GetAllSalesByUserIdPayload } from "../../../utils/types/getAllSalesByUserId.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{productName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableBody>
              {items.map(item => {
                const sale = allSales.find(s => s.id === item.saleId);
                const price = item.isSpecialPrice && item.product.SackPrice[0]?.specialPrice?.price
                  ? item.product.SackPrice[0]?.specialPrice?.price
                  : (item.product.SackPrice[0]?.price || item.product.perKiloPrice?.price || 0);
                const totalPrice = Math.floor(price * item.quantity);
                const paymentInfo = sale?.paymentMethod !== 'CASH' 
                  ? ` (${sale?.paymentMethod.replace('_', ' ')})`
                  : '';
                const specialPriceInfo = item.isSpecialPrice ? ' (special price)' : '';
                const gantangInfo = item.isGantang ? ' (gantang)' : '';
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.quantity} {productName}{gantangInfo}{specialPriceInfo} = {totalPrice}{paymentInfo}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div>
            <h3 className="text-lg font-semibold mb-2">Sale Summary</h3>
            <Separator className="my-2" />
            
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Quantity:</TableCell>
                  <TableCell className="text-right">{totalQuantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Amount:</TableCell>
                  <TableCell className="text-right">₱{Math.floor(totalAmount)}</TableCell>
                </TableRow>
                
                {checkTotal > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">CHECK Deduction:</TableCell>
                    <TableCell className="text-right">- ₱{Math.floor(checkTotal)}</TableCell>
                  </TableRow>
                )}
                
                {bankTransferTotal > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">BANK TRANSFER Deduction:</TableCell>
                    <TableCell className="text-right">- ₱{Math.floor(bankTransferTotal)}</TableCell>
                  </TableRow>
                )}
                
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">NET TOTAL (CASH):</TableCell>
                  <TableCell className="text-right font-bold">₱{Math.floor(cashTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}