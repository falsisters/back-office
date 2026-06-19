"use client";

import { AttachmentList } from "@/components/Attachments/AttachmentList";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function AttachmentsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/login");
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">Attachments</h1>
      </div>
      <AttachmentList />
    </div>
  );
}
