"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const permissionTypes = ["PRICES", "DELIVERIES", "STOCKS", "PROFITS", "KAHON", "SALES_CHECK", "SALES_HISTORY"]

interface CreateCashierProps {
  onSubmit: (data: { name: string; accessKey: string; permissions: string[] }) => void
}

export function CreateCashier({ onSubmit }: CreateCashierProps) {
  const [name, setName] = useState("")
  const [accessKey, setAccessKey] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, accessKey, permissions })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Cashier</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessKey">Access Key</Label>
            <Input id="accessKey" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {permissionTypes.map((perm) => (
                <div key={perm} className="flex items-center space-x-2">
                  <Checkbox
                    id={perm}
                    checked={permissions.includes(perm)}
                    onCheckedChange={(checked: unknown) => {
                      setPermissions(checked ? [...permissions, perm] : permissions.filter((p) => p !== perm))
                    }}
                  />
                  <Label htmlFor={perm}>{perm}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit">Create Cashier</Button>
        </form>
      </CardContent>
    </Card>
  )
}

