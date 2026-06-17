import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  FeeType,
  AuditLogEntry,
  Staff,
  PaginatedResponse,
  Application,
} from "@/lib/types";

export const adminApi = {
  students: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiGet<PaginatedResponse<Application>>(`/admin/students${q}`);
  },

  feeTypes: () => apiGet<FeeType[]>("/admin/fee-types"),
  updateFeeType: (id: string, data: Partial<FeeType>) =>
    apiPatch<FeeType>(`/admin/fee-types/${id}`, data),

  auditLog: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiGet<PaginatedResponse<AuditLogEntry>>(`/admin/audit${q}`);
  },

  staff: () => apiGet<Staff[]>("/admin/users"),
  createStaff: (data: Omit<Staff, "id" | "createdAt">) =>
    apiPost<Staff>("/admin/users", data),
  updateStaff: (id: string, data: Partial<Staff>) =>
    apiPatch<Staff>(`/admin/users/${id}`, data),
  deleteStaff: (id: string) => apiDelete(`/admin/users/${id}`),

  getOffer: (applicationId: string) =>
    apiGet<import("@/lib/types").Offer>(`/admin/applications/${applicationId}/offer`),
};
