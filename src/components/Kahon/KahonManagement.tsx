"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, FileSpreadsheet, Archive } from "lucide-react"
import KahonSheets from "./KahonSheets"
import InventorySheets from "./InventorySheets"

export default function KahonManagement() {
  const [activeTab, setActiveTab] = useState("kahon-sheets")

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Kahon Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage your Kahon sheets and inventory data
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Card className="w-full shadow-md">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-gradient-to-r from-gray-50 to-white">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 rounded-none">
                <TabsTrigger 
                  value="kahon-sheets" 
                  className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Kahon Sheets
                </TabsTrigger>
                <TabsTrigger 
                  value="inventory-sheets"
                  className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <Archive className="h-4 w-4" />
                  Inventory Sheets
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="kahon-sheets" className="mt-0">
                <KahonSheets />
              </TabsContent>

              <TabsContent value="inventory-sheets" className="mt-0">
                <InventorySheets />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}