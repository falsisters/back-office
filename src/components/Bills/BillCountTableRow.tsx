"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditBillCounts } from "./EditBillCount";
import type { GetBillCountForDatePayload } from "../../../utils/types/getBillCountByDate.type";
import { cn } from "@/lib/utils";

interface BillCountTableRowProps {
  billCount: GetBillCountForDatePayload;
  cashierId: string;
  onRefresh: () => Promise<void>;
}

export function BillCountTableRow({
  billCount,
  cashierId,
  onRefresh,
}: BillCountTableRowProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const getBillTypeLabel = (type: string) => {
    switch (type) {
      case "THOUSAND":
        return "₱1,000";
      case "FIVE_HUNDRED":
        return "₱500";
      case "HUNDRED":
        return "₱100";
      case "FIFTY":
        return "₱50";
      case "TWENTY":
        return "₱20";
      case "COINS":
        return "Coins";
      default:
        return type;
    }
  };

  const getBillTypeColor = (type: string) => {
    switch (type) {
      case "THOUSAND":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FIVE_HUNDRED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "HUNDRED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FIFTY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "TWENTY":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "COINS":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "";
    }
  };

  const billTypeOrder = [
    "THOUSAND",
    "FIVE_HUNDRED",
    "HUNDRED",
    "FIFTY",
    "TWENTY",
    "COINS",
  ];

  if (!billCount) return null;

  const sortedBills = [...billCount.bills].sort((a, b) => {
    return billTypeOrder.indexOf(a.type) - billTypeOrder.indexOf(b.type);
  });

  return (
    <>
      {/* Single edit button row */}
      <TableRow>
        <TableCell colSpan={4} className="text-right pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Bill Counts
          </Button>
        </TableCell>
      </TableRow>

      {/* Bill rows */}
      {sortedBills.map((bill) => (
        <TableRow key={bill.id} className="hover:bg-muted/20">
          <TableCell className="w-1/4">
            <Badge
              variant="outline"
              className={cn("font-medium", getBillTypeColor(bill.type))}
            >
              {getBillTypeLabel(bill.type)}
            </Badge>
          </TableCell>
          <TableCell className="w-1/4 font-medium text-center">
            {bill.amount} bills
          </TableCell>
          <TableCell className="w-1/4 font-semibold text-secondary text-center">
            ₱{bill.value.toLocaleString()}
          </TableCell>
          <TableCell className="w-1/4"></TableCell>
        </TableRow>
      ))}

      <EditBillCounts
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        billCount={billCount}
        cashierId={cashierId}
        onSuccess={onRefresh}
      />
    </>
  );
}
