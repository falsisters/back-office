"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { toast } from "sonner";
import type { Attachment } from "../../utils/types/schema.type";

async function fetchAttachments(): Promise<Attachment[]> {
  const { data } = await apiClient.get("/api/attachment/user");
  return Array.isArray(data) ? data : [];
}

async function fetchAttachment(id: string): Promise<Attachment> {
  const { data } = await apiClient.get(`/api/attachment/${id}`);
  return data;
}

async function createAttachmentFn(formData: FormData): Promise<Attachment> {
  const { data } = await apiClient.post("/api/attachment/user/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

async function editAttachmentFn({
  id,
  data,
}: {
  id: string;
  data: { name?: string; type?: string };
}): Promise<Attachment> {
  const { data: response } = await apiClient.patch(
    `/api/attachment/user/${id}`,
    data
  );
  return response;
}

async function deleteAttachmentFn(id: string): Promise<void> {
  await apiClient.delete(`/api/attachment/user/${id}`);
}

export function useAttachments() {
  return useQuery({
    queryKey: ["attachments"],
    queryFn: fetchAttachments,
  });
}

export function useAttachment(id: string) {
  return useQuery({
    queryKey: ["attachments", id],
    queryFn: () => fetchAttachment(id),
    enabled: !!id,
  });
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAttachmentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      toast.success("Attachment created successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useEditAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editAttachmentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      toast.success("Attachment updated successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachmentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      toast.success("Attachment deleted successfully");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}
