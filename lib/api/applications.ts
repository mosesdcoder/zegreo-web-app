import { apiGet, apiPost, apiPatch } from "./client";
import type {
  Application,
  PersonalDetails,
  EducationHistory,
  NextOfKin,
  PaginatedResponse,
} from "@/lib/types";

export const applicationsApi = {
  // Applicant: list own applications
  list: () => apiGet<Application[]>("/applications/me"),

  get: (id: string) => apiGet<Application>(`/applications/${id}`),

  create: (programId: string, intakeId: string) =>
    apiPost<Application>("/applications", { programId, intakeId }),

  patchPersonal: (id: string, data: Partial<PersonalDetails>) =>
    apiPatch<Application>(`/applications/${id}`, { personalJson: JSON.stringify(data) }),

  patchEducation: (id: string, data: { history: EducationHistory[] }) =>
    apiPatch<Application>(`/applications/${id}`, { educationHistoryJson: JSON.stringify(data.history) }),

  patchNextOfKin: (id: string, data: Partial<NextOfKin>) =>
    apiPatch<Application>(`/applications/${id}`, { nextOfKinJson: JSON.stringify(data) }),

  submit: (id: string) =>
    apiPost<Application>(`/applications/${id}/submit`),

  // Admin actions
  adminList: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiGet<PaginatedResponse<Application>>(`/admin/applications${q}`);
  },

  adminGet: (id: string) => apiGet<Application>(`/admin/applications/${id}`),

  makeOffer: (id: string, data: { conditions?: string; expiresAt: string }) =>
    apiPost<import("@/lib/types").Offer>(`/admin/applications/${id}/offer`, data),

  reject: (id: string, reason: string) =>
    apiPost<Application>(`/admin/applications/${id}/reject`, { reason }),

  requestInfo: (id: string, note: string) =>
    apiPost<Application>(`/admin/applications/${id}/request-info`, { reason: note }),
};
