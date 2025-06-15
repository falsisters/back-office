"use client";

import { useEffect, useState } from "react";
import { getAllAttachments } from "@/lib/server/Attachment/getAllAttachments";
import { deleteAttachment } from "@/lib/server/Attachment/deleteAttachment";
import type { GetAllAttachmentsPayload } from "../../../utils/types/getAllAttachments.type";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CalendarIcon, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  const [attachments, setAttachments] = useState<GetAllAttachmentsPayload>([]);
  const [filteredAttachments, setFilteredAttachments] =
    useState<GetAllAttachmentsPayload>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<
    GetAllAttachmentsPayload[number] | null
  >(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAttachments();
  }, []);

  useEffect(() => {
    if (attachments.length > 0) {
      let filtered = [...attachments];

      if (date) {
        filtered = filtered.filter((attachment) => {
          const attachmentDate = new Date(attachment.createdAt);
          return attachmentDate.toDateString() === date.toDateString();
        });
      }

      setFilteredAttachments(filtered);
    }
  }, [attachments, date]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAttachments(attachments);
    } else {
      const filtered = attachments.filter((attachment) =>
        attachment.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAttachments(filtered);
    }
  }, [searchTerm, attachments]);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAttachments();
      setAttachments(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attachments"
      );
      console.error("Error fetching attachments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await deleteAttachment(id);
      toast({
        title: "Attachment deleted",
        description: "The attachment has been successfully deleted.",
      });
      setAttachments(attachments.filter((attachment) => attachment.id !== id));
    } catch (error) {
      console.error("Error deleting: ", error);
      toast({
        title: "Error",
        description: "Failed to delete the attachment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAttachmentCreated = (newAttachment: {
    id: string;
    name: string;
    type:
      | "EXPENSE_RECEIPT"
      | "CHECKS_AND_BANK_TRANSFER"
      | "INVENTORIES"
      | "SUPPORTING_DOCUMENTS";
    url: string;
  }) => {
    setAttachments((prev) => [
      ...prev,
      {
        ...newAttachment,
        userId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    toast({
      title: "Attachment created",
      description: "New attachment has been successfully added.",
    });
  };

  const handleAttachmentUpdated = (
    updatedAttachment: GetAllAttachmentsPayload[number]
  ) => {
    setAttachments((prev) =>
      prev.map((attachment) =>
        attachment.id === updatedAttachment.id ? updatedAttachment : attachment
      )
    );
  };

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
        <CreateAttachment onAttachmentCreated={handleAttachmentCreated} />
        {/* Search bar implementation */}
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

      {error ? (
        <Card className="w-full border-red-200 shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() => fetchAttachments()}
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
              onUpdate={handleAttachmentUpdated}
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
                onUpdate={handleAttachmentUpdated}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
