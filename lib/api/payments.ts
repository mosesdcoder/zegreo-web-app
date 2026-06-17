import { apiGet, apiPost } from "./client";
import type { Invoice, Payment, PaginatedResponse } from "@/lib/types";

export const paymentsApi = {
  listInvoices: (applicationId: string) =>
    apiGet<Invoice[]>(`/applications/${applicationId}/invoices`),

  listPayments: (applicationId: string) =>
    apiGet<any[]>(`/applications/${applicationId}/payments`),

  // Unified initiate endpoint — backend uses POST /payments/initiate
  initiateMpesa: (invoiceId: string, phone: string) =>
    apiPost<Payment>(`/payments/initiate`, { invoiceId, channel: "Mpesa", mobileNumber: phone }),

  pollMpesa: (reference: string) =>
    apiGet<Payment>(`/payments/${reference}/status`),

  initiateCard: (invoiceId: string) =>
    apiPost<{ redirectUrl: string; authorizationUrl: string }>(`/payments/initiate`, { invoiceId, channel: "Card" }),

  getPayment: (reference: string) =>
    apiGet<Payment>(`/payments/${reference}/status`),

  /** Dev-only: creates + confirms a payment for an invoice in one step. No Paystack involved. */
  simulatePay: (invoiceId: string) =>
    apiPost<Payment>(`/dev/payments/invoices/${invoiceId}/pay`, {}),

  /** Dev-only: confirms an already-initiated pending payment by reference. */
  simulate: (reference: string) =>
    apiPost<Payment>(`/dev/payments/${reference}/simulate`, {}),

  // Admin
  adminList: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiGet<PaginatedResponse<Payment>>(`/admin/payments${q}`);
  },

  exportCsv: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiGet<Blob>(`/admin/payments/export${q}`);
  },
};
