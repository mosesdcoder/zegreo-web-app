import { apiGet, apiPost } from "./client";
import type { Offer } from "@/lib/types";

export const offerApi = {
  get: (applicationId: string) =>
    apiGet<Offer>(`/applications/${applicationId}/offer`),

  accept: (applicationId: string) =>
    apiPost<Offer>(`/applications/${applicationId}/offer/accept`),

  downloadLetter: (applicationId: string) =>
    apiGet<Blob>(`/applications/${applicationId}/offer/letter`),
};
