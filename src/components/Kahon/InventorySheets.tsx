"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Package, AlertCircle } from "lucide-react"

export default function InventorySheets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-full">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Inventory Sheets</h3>
          <p className="text-sm text-muted-foreground">
            Manage and view your inventory data sheets
          </p>
        </div>
      </div>

      <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Inventory sheets functionality is under development
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              This feature will allow you to manage and analyze your inventory data with advanced 
              filtering, reporting, and data visualization capabilities.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-700">
              Expected features:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Real-time inventory tracking</li>
                <li>Stock level monitoring</li>
                <li>Automated reorder alerts</li>
                <li>Comprehensive reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}