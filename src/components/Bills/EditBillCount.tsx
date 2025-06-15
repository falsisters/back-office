"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { editCashierBillCount } from "@/lib/server/BillCount/editCashierBillCount";
import {
  UpdateBillCountSchema,
  type UpdateBillCountType,
} from "../../../utils/types/BillCount/editBillCount.type";
import type { GetBillCountForDatePayload } from "../../../utils/types/BillCount/getBillCountByDate.type";

interface ConsolidatedEditBillCountsProps {
  isOpen: boolean;
  onClose: () => void;
  billCount: GetBillCountForDatePayload;
  cashierId: string;
  onSuccess: () => Promise<void>;
}

export function EditBillCounts({
  isOpen,
  onClose,
  billCount,
  cashierId,
  onSuccess,
}: ConsolidatedEditBillCountsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateBillCountType>({
    resolver: zodResolver(UpdateBillCountSchema),
    defaultValues: {
      beginningBalance: billCount?.beginningBalance || 0,
      showBeginningBalance: billCount?.showBeginningBalance || false,
      bills:
        billCount?.bills.map((bill) => ({
          amount: bill.amount,
          type: bill.type,
        })) || [],
    },
  });

  const onSubmit = async (data: UpdateBillCountType) => {
    if (!billCount) return;

    setIsSubmitting(true);
    try {
      await editCashierBillCount(cashierId, billCount.id, data);
      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update bill count:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Edit Bill Count Summary
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Beginning Balance Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Beginning Balance
              </h3>
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="showBeginningBalance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                      <div className="space-y-0.5">
                        <FormLabel>Show Beginning Balance</FormLabel>
                        <FormDescription>
                          Display the starting balance for this count
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("showBeginningBalance") && (
                <FormField
                  control={form.control}
                  name="beginningBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beginning Balance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            ₱
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Bill Counts Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Bill Counts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.watch("bills")?.map((bill, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="font-medium text-primary">
                      {getBillTypeLabel(bill.type)}
                    </div>
                    <FormField
                      control={form.control}
                      name={`bills.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
