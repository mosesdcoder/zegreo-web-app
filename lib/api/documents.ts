import { apiGet, apiPost, apiPatch } from "./client";
import type { Document } from "@/lib/types";

export const documentsApi = {
  list: (applicationId: string) =>
    apiGet<Document[]>(`/applications/${applicationId}/documents`),

  upload: (applicationId: string, documentType: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", documentType);
    return apiPost<Document>(`/applications/${applicationId}/documents`, form);
  },

  // Admin: document action is PATCH /admin/documents/{docId}
  verify: (applicationId: string, documentId: string) =>
    apiPatch<Document>(`/admin/documents/${documentId}`, { action: "verify" }),

  reject: (applicationId: string, documentId: string, reason: string) =>
    apiPatch<Document>(`/admin/documents/${documentId}`, { action: "reject", reason }),

  requestResubmit: (applicationId: string, documentId: string, reason: string) =>
    apiPatch<Document>(`/admin/documents/${documentId}`, { action: "request-resubmit", reason }),
};
