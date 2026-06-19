"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAttachments, useDeleteAttachment } from "@/hooks/useAttachments";
import type { Attachment } from "../../../utils/types/schema.type";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CalendarIcon, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AttachmentCard } from "./AttachmentCard";
import { CreateAttachment } from "./CreateAttachments";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttachmentDetails } from "./AttachmentDetails";
import { SearchBar } from "../SearchBar";

export function AttachmentList() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  const { data: attachments = [], isLoading, isError, error, refetch } = useAttachments();
  const deleteMutation = useDeleteAttachment();

  const handleDeleteAttachment = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const filteredAttachments = useMemo(() => {
    let filtered = [...attachments];

    if (date) {
      filtered = filtered.filter((attachment) => {
        const attachmentDate = new Date(attachment.createdAt);
        return attachmentDate.toDateString() === date.toDateString();
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((attachment) =>
        attachment.name.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [attachments, date, searchTerm]);

  useEffect(() => {
    if (isError && error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load attachments"
      );
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary font-medium">
          Loading attachments...
        </span>
      </div>
    );
  }

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CreateAttachment />
        <div className="relative flex-1">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search attachments by name..."
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClearSearch}
            >
              <span className="sr-only">Clear search</span>×
            </Button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM do, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {isError ? (
        <Card className="w-full border-red-200 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">
                {error instanceof Error ? error.message : "Failed to load attachments"}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredAttachments.length === 0 ? (
        <Card className="w-full shadow-md bg-gradient-to-b from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64">
              <FileIcon className="w-12 h-12 text-primary/40 mb-4" />
              <p className="text-muted-foreground font-medium">
                No attachments found
                {date && (
                  <span className="text-sm block mt-1">
                    for {format(date, "MMM dd, yyyy")}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAttachments.map((attachment) => (
            <AttachmentCard
              key={attachment.id}
              attachment={attachment}
              onDelete={handleDeleteAttachment}
              onView={() => setSelectedAttachment(attachment)}
              onUpdate={() => refetch()}
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedAttachment}
        onOpenChange={(open) => !open && setSelectedAttachment(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {selectedAttachment && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAttachment.name}</DialogTitle>
              </DialogHeader>
              <AttachmentDetails
                attachment={selectedAttachment}
                onClose={() => setSelectedAttachment(null)}
                onUpdate={() => {
                  refetch();
                  setSelectedAttachment(null);
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
