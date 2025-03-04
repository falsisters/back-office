"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDeliveryById } from "@/lib/server/getDeliveryById";
import type { GetDeliveryByIdPayload } from "../../../utils/types/getDeliveryById.type";
import { deleteDelivery } from "@/lib/server/deleteDelivery";
import { Loader2, Trash2Icon } from "lucide-react";

interface DeliveryItemProps {
  delivery: GetDeliveryByIdPayload;
  onDelete: (deletedDeliveryId: string) => void;
}

export function DeliveryItem({ delivery, onDelete }: DeliveryItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailedDelivery, setDetailedDelivery] =
    useState<GetDeliveryByIdPayload | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = async () => {
    try {
      const details = await getDeliveryById(delivery.id);
      setDetailedDelivery(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch delivery details:", error);
      alert("Failed to fetch delivery details. Please try again.");
    }
  };
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDelivery(delivery.id);
      onDelete(delivery.id);
    } catch (error) {
      console.error("Failed to delete sale:", error);
      alert("Failed to delete sale. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="items-center text-xs md:text-lg">
            <span>Delivery #{delivery.id}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-xs md:text-lg">
            <div>
              <p className="mb-2">
                <strong>Total:</strong> ${delivery.total.toFixed(2)}
              </p>
              <div className="mb-2">
                <strong>Status:</strong>{" "}
                {delivery.isFinished ? (
                  <Badge className="bg-green-500">Finished</Badge>
                ) : (
                  <Badge className="bg-blue-500">In Progress</Badge>
                )}
              </div>
              <p className="mb-2">
                <strong>Created:</strong>{" "}
                {new Date(delivery.createdAt).toLocaleString()}
              </p>
              {delivery.isFinished && delivery.timeFinished && (
                <p className="mb-2">
                  <strong>Finished:</strong>{" "}
                  {new Date(delivery.timeFinished).toLocaleString()}
                </p>
              )}
              <div className="flex flex-row items-center justify-between">
              <Button onClick={handleViewDetails}>View Details</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2Icon className="w-6 h-6" />
              </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Delivery Details #{detailedDelivery?.id}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {detailedDelivery && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p>
                      <strong>Total:</strong> $
                      {detailedDelivery.total.toFixed(2)}
                    </p>
                    <p>
                      <strong>Driver:</strong> {detailedDelivery.driver}
                    </p>
                    <p>
                      <strong>Cashier:</strong> {detailedDelivery.cashier.name}
                    </p>
                  </div>
                  <div>
                    <div>
                      <strong>Status:</strong>{" "}
                      {detailedDelivery.isFinished ? (
                        <Badge className="bg-green-500">Finished</Badge>
                      ) : (
                        <Badge className="bg-blue-500">In Progress</Badge>
                      )}
                    </div>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(detailedDelivery.createdAt).toLocaleString()}
                    </p>
                    {detailedDelivery.isFinished &&
                      detailedDelivery.timeFinished && (
                        <p>
                          <strong>Finished:</strong>{" "}
                          {new Date(
                            detailedDelivery.timeFinished
                          ).toLocaleString()}
                        </p>
                      )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Items:</h3>
                  <ul className="list-disc list-inside">
                    {detailedDelivery.items.map((item) => (
                      <li key={item.id}>
                        {item.product.name} - {item.qty} x $
                        {item.price.toFixed(2)} ({item.type})
                      </li>
                    ))}
                  </ul>
                </div>
                {detailedDelivery.attachments &&
                  detailedDelivery.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Attachments:</h3>
                      <ul className="list-disc list-inside">
                        {detailedDelivery.attachments.map(
                          (attachment, index) => (
                            <li key={index}>
                              <a
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Attachment {index + 1}
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Sale #{delivery.id}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
