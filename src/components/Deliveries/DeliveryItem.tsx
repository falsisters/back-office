"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getDeliveryById } from "@/lib/server/getDeliveryById"
import type { GetDeliveryByIdPayload } from "../../../utils/types/getDeliveryById.type"
import { deleteDelivery } from "@/lib/server/deleteDelivery"
import {
  Loader2,
  Trash2Icon,
  TruckIcon,
  PackageIcon,
  ExternalLinkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
} from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

interface DeliveryItemProps {
  delivery: GetDeliveryByIdPayload
  onDelete: (deletedDeliveryId: string) => void
}

export function DeliveryItem({ delivery, onDelete }: DeliveryItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailedDelivery, setDetailedDelivery] = useState<GetDeliveryByIdPayload | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleViewDetails = async () => {
    try {
      setIsLoading(true)
      const details = await getDeliveryById(delivery.id)
      setDetailedDelivery(details)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Failed to fetch delivery details:", error)
      alert("Failed to fetch delivery details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      // Optimistically update UI first
      onDelete(delivery.id)

      // Then perform the actual deletion
      await deleteDelivery(delivery.id)
    } catch (error) {
      console.error("Failed to delete delivery:", error)
      alert("Failed to delete delivery. Please try again.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold">Delivery #{delivery.id.slice(-6)}</span>
            </div>
            <Badge variant="outline" className="font-normal bg-primary/5 text-primary border-primary/20">
              {delivery.DeliveryItem?.length || 0} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" />
                Driver
              </p>
              <p className="font-semibold">{delivery.driverName}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Scheduled
              </p>
              <p className="font-semibold">{format(new Date(delivery.deliveryTimeStart), "MMM dd, yyyy")}</p>
              <p className="text-xs text-secondary flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {format(new Date(delivery.deliveryTimeStart), "HH:mm")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              disabled={isLoading}
              className="gap-1 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                  View Details
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-1 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2Icon className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl border-t-4 border-t-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <TruckIcon className="w-6 h-6" />
              Delivery Details
            </DialogTitle>
            <DialogDescription className="text-sm">ID: {detailedDelivery?.id}</DialogDescription>
          </DialogHeader>

          {detailedDelivery && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      Driver Name
                    </p>
                    <p className="font-semibold">{detailedDelivery.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Scheduled Time
                    </p>
                    <p className="font-semibold">
                      {format(new Date(detailedDelivery.deliveryTimeStart), "MMM dd, yyyy")}
                      <span className="text-secondary ml-2">
                        {format(new Date(detailedDelivery.deliveryTimeStart), "HH:mm")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      Created At
                    </p>
                    <p className="font-semibold">
                      {format(new Date(detailedDelivery.createdAt), "MMM dd, yyyy")}
                      <span className="text-muted-foreground ml-2">
                        {format(new Date(detailedDelivery.createdAt), "HH:mm")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 text-primary flex items-center gap-2">
                  <PackageIcon className="w-4 h-4" />
                  Delivery Items
                </h3>
                {detailedDelivery.DeliveryItem && detailedDelivery.DeliveryItem.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {detailedDelivery.DeliveryItem.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <PackageIcon className="w-4 h-4 text-primary" />
                            <p className="font-medium">{item.product.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">Product ID: {item.product.id.slice(-6)}</p>
                        </div>
                        <Badge className="px-3 py-1 text-sm bg-secondary/10 text-secondary border-secondary/20">
                          {item.quantity} KG
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 border border-dashed rounded-md bg-muted/20">
                    <p className="text-muted-foreground">No items in this delivery</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-t-4 border-t-red-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2Icon className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Delivery #{delivery.id.slice(-6)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 p-4 rounded-md border border-red-200 my-2">
            <p className="text-sm text-red-600 font-medium">
              This will permanently remove the delivery and all associated items.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

