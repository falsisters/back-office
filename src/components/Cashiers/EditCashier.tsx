"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { editCashier } from "@/lib/server/editCashier"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import type { Cashier, CashierPermissions } from "../../../utils/types/schema.type"
import { Alert, AlertDescription } from "@/components/ui/alert"

const permissionTypes: CashierPermissions[] = [
  "SALES",
  "DELIVERIES",
  "STOCKS",
  "EDIT_PRICE",
  "KAHON",
  "PROFITS",
  "ATTACHMENTS",
  "SALES_HISTORY",
]

interface EditCashierProps {
  cashier: Cashier
  isOpen: boolean
  onClose: () => void
  onCashierUpdated: (updatedCashier: Cashier) => void
}

export function EditCashier({ cashier, isOpen, onClose, onCashierUpdated }: EditCashierProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(cashier.name)
  const [accessKey, setAccessKey] = useState(cashier.accessKey)
  const [permissions, setPermissions] = useState<CashierPermissions[]>(cashier.permissions)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setName(cashier.name)
      setAccessKey(cashier.accessKey)
      setPermissions(cashier.permissions)
    }
  }, [isOpen, cashier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setIsLoading(true)
      const updatedCashier = await editCashier(cashier.id, {
        name,
        accessKey,
        permissions,
      })

      onCashierUpdated(updatedCashier)
      toast({
        title: "Success",
        description: "Cashier updated successfully",
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cashier")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] shadow-xl border-t-4 border-t-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Edit Cashier</DialogTitle>
          <DialogDescription>Update cashier information and permissions</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={4}
              required
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessKey" className="text-sm font-medium">
              Access Key
            </Label>
            <Input
              id="accessKey"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              maxLength={4}
              required
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissions</Label>
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-md">
              {permissionTypes.map((perm) => (
                <div key={perm} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm}
                    checked={permissions.includes(perm)}
                    onCheckedChange={(checked) => {
                      setPermissions((prev) => (checked ? [...prev, perm] : prev.filter((p) => p !== perm)))
                    }}
                    className="text-primary border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={perm} className="capitalize text-sm">
                    {perm.toLowerCase().replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

