"use client"

import { useState } from "react"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { createBillCount } from "@/lib/server/createBillCount"
import { CreateBillCountSchema, type CreateBillCountType } from "../../../utils/types/createBillCount.type"

interface CreateBillCountsProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
  selectedDate?: Date
}

export function CreateBillCounts({ isOpen, onClose, onSuccess, selectedDate }: CreateBillCountsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateBillCountType>({
    resolver: zodResolver(CreateBillCountSchema),
    defaultValues: {
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      expenses: 0,
      showExpenses: false,
      beginningBalance: 0,
      showBeginningBalance: false,
      bills: [
        { amount: 0, type: "THOUSAND" },
        { amount: 0, type: "FIVE_HUNDRED" },
        { amount: 0, type: "HUNDRED" },
        { amount: 0, type: "FIFTY" },
        { amount: 0, type: "TWENTY" },
        { amount: 0, type: "COINS" },
      ],
    },
  })

  const onSubmit = async (data: CreateBillCountType) => {
    setIsSubmitting(true)
    try {
      await createBillCount(data)
      await onSuccess()
      onClose()
      form.reset()
    } catch (error) {
      console.error("Failed to create bill count:", error)
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Create Bill Count</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  "Save Bill Count"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
