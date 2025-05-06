"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { editBillCount } from "@/lib/server/editBillCount"
import { UpdateBillCountSchema, type UpdateBillCountType } from "../../../utils/types/editBillCount.type"
import type { GetBillCountForDatePayload } from "../../../utils/types/getBillCountByDate.type"

interface EditBillCountsProps {
  isOpen: boolean
  onClose: () => void
  billCount: GetBillCountForDatePayload
  billType: string | null
  onSuccess: () => Promise<void>
}

export function EditBillCounts({ isOpen, onClose, billCount, billType, onSuccess }: EditBillCountsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the bill with the selected type
  const selectedBill = billCount?.bills.find((bill) => bill.type === billType)

  const form = useForm<UpdateBillCountType>({
    resolver: zodResolver(UpdateBillCountSchema),
    defaultValues: {
      expenses: billCount?.expenses || 0,
      showExpenses: billCount?.showExpenses || false,
      beginningBalance: billCount?.beginningBalance || 0,
      showBeginningBalance: billCount?.showBeginningBalance || false,
      bills:
        billCount?.bills.map((bill) => ({
          amount: bill.amount,
          type: bill.type,
        })) || [],
    },
  })

  const onSubmit = async (data: UpdateBillCountType) => {
    if (!billCount) return

    setIsSubmitting(true)
    try {
      // If editing a specific bill type, update only that bill
      if (billType && selectedBill) {
        const updatedBills = billCount.bills.map((bill) => {
          if (bill.type === billType) {
            const updatedBill = data.bills?.find((b) => b.type === billType)
            return {
              amount: updatedBill?.amount || bill.amount,
              type: bill.type,
            }
          }
          return {
            amount: bill.amount,
            type: bill.type,
          }
        })

        await editBillCount(billCount.id, {
          ...data,
          bills: updatedBills,
        })
      } else {
        // Otherwise update everything
        await editBillCount(billCount.id, data)
      }

      await onSuccess()
      onClose()
    } catch (error) {
      console.error("Failed to update bill count:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBillTypeLabel = (type: string) => {
    switch (type) {
      case "THOUSAND":
        return "₱1,000"
      case "FIVE_HUNDRED":
        return "₱500"
      case "HUNDRED":
        return "₱100"
      case "FIFTY":
        return "₱50"
      case "TWENTY":
        return "₱20"
      case "COINS":
        return "Coins"
      default:
        return type
    }
  }

  // If a specific bill type is selected, show only that bill's form
  const renderBillForm = () => {
    if (billType && selectedBill) {
      const index = billCount?.bills.findIndex((bill) => bill.type === billType) || 0

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Edit {getBillTypeLabel(billType)}</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`bills.${index}.type`}
              render={({ }) => (
                <FormItem>
                  <FormLabel>Bill Type</FormLabel>
                  <FormControl>
                    <Input value={getBillTypeLabel(selectedBill.type)} disabled className="bg-muted/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`bills.${index}.amount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )
    }

    // Otherwise show the full form
    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="showBeginningBalance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show Beginning Balance</FormLabel>
                    <FormDescription>Display the starting balance for this count</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">₱</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Bill Counts</h3>
          {form.watch("bills")?.map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`bills.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Type</FormLabel>
                    <FormControl>
                      <Input value={getBillTypeLabel(field.value)} disabled className="bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`bills.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="showExpenses"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show Expenses</FormLabel>
                    <FormDescription>Include expenses in the final calculation</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {form.watch("showExpenses") && (
            <FormField
              control={form.control}
              name="expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expenses</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">₱</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {billType ? `Edit ${getBillTypeLabel(billType)}` : "Edit Bill Count"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderBillForm()}

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
  )
}
