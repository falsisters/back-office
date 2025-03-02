"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCashierById } from "@/lib/server/getCashierById"
import { editCashier } from "@/lib/server/editCashier"
import { useToast } from "@/hooks/use-toast"
import { EditCashierFormData } from "../../../utils/types/editCashier.type"
import { Checkbox } from "@/components/ui/checkbox"
import type { CashierPermissionType } from "../../../utils/types/schema.type"

const permissionTypes: CashierPermissionType[] = [
  "PRICES",
  "DELIVERIES",
  "STOCKS",
  "PROFITS",
  "KAHON",
  "SALES_CHECK",
  "SALES_HISTORY",
]

interface EditCashierDialogProps {
  cashierId: string
  isOpen: boolean
  onClose: () => void
}

export function EditCashier({ cashierId, isOpen, onClose }: EditCashierDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [accessKey, setAccessKey] = useState("")
  const [permissions, setPermissions] = useState<CashierPermissionType[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      const fetchCashierData = async () => {
        try {
          const cashierData = await getCashierById(cashierId)
          setName(cashierData.name)
          setAccessKey(cashierData.accessKey)
          setPermissions(cashierData.permissions.map((p: any) => p.name))
        } catch (error) {
          console.error("Error fetching cashier data:", error)
          toast({
            title: "Error",
            description: "Failed to fetch cashier data. Please try again.",
            variant: "destructive",
          })
          onClose()
        }
      }
      fetchCashierData()
    }
  }, [isOpen, cashierId, toast, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (name && name.length < 4) {
      setError("Name must be 4 or more characters")
      return
    }
    
    if (accessKey && accessKey.length !== 4) {
      setError("Access key must be exactly 4 characters")
      return
    }

    setIsLoading(true)
    
    const formData: EditCashierFormData = {
      name,
      accessKey,
      permissions: permissions.map(perm => ({ name: perm })),
    }

    try {
      await editCashier(cashierId, formData)
      toast({
        title: "Cashier updated",
        description: "Cashier has been successfully updated.",
      })
      onClose()
    } catch (error) {
      console.error("Error updating cashier:", error)
      toast({
        title: "Error",
        description: "Failed to update cashier. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Cashier</DialogTitle>
          <DialogDescription>Update the cashier&apos;s information. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
            <p className="text-sm text-gray-500">Enter the cashier&apos;s full name (minimum 4 characters).</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessKey">Access Key</Label>
            <Input 
              id="accessKey" 
              type="password" 
              value={accessKey} 
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="****" 
              maxLength={4}
            />
            <p className="text-sm text-gray-500">Update the cashier&apos;s access key (exactly 4 characters).</p>
          </div>
          
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissionTypes.map((perm) => (
                <div key={perm} className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-${perm}`}
                    checked={permissions.includes(perm)}
                    onCheckedChange={(checked) => {
                      setPermissions(
                        checked 
                          ? [...permissions, perm] 
                          : permissions.filter((p) => p !== perm)
                      )
                    }}
                  />
                  <Label htmlFor={`perm-${perm}`}>{perm}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}