"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api/applications";
import { paymentsApi } from "@/lib/api/payments";
import { FeeTable } from "@/components/brand/fee-table";
import { PaymentMethodPicker } from "@/components/brand/payment-method-picker";
import { Banner } from "@/components/brand/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusChip } from "@/components/brand/status-chip";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { formatKes, formatDate } from "@/lib/format";
import type { Payment, PaymentMethod } from "@/lib/types";
import { CheckCircle, Clock, RefreshCw, FlaskConical } from "lucide-react";

const IS_SIMULATE = process.env.NEXT_PUBLIC_PAYMENT_SIMULATE === "true";

export default function PaymentsPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const preselectedInvoiceId = searchParams.get("invoiceId");

  const { data: appList, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];

  const { data: rawInvoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", app?.id],
    queryFn: () => paymentsApi.listInvoices(app!.id),
    enabled: !!app?.id,
  });

  // Normalise invoice field names from backend (feeCode/amount/dueAt → label/amountKes/dueDate)
  const invoices: any[] = (Array.isArray(rawInvoices) ? rawInvoices : (rawInvoices as any)?.items ?? (rawInvoices as any)?.data ?? [])
    .map((inv: any) => ({
      ...inv,
      label: inv.label ?? inv.feeCode ?? inv.feeName ?? "Fee",
      amountKes: inv.amountKes ?? inv.amount ?? 0,
      dueDate: inv.dueDate ?? inv.dueAt ?? null,
      paidAt: inv.paidAt ?? inv.completedAt ?? null,
      // Normalise status: "Unpaid"→"PENDING", "Paid"→"SUCCESS"
      status: (() => {
        const s = (inv.status ?? "").toLowerCase();
        if (s === "paid") return "SUCCESS";
        if (s === "unpaid" || s === "partiallypaid") return "PENDING";
        return (inv.status ?? "").toUpperCase();
      })(),
    }));

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("MPESA");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null);
  const [successPayment, setSuccessPayment] = useState<Payment | null>(null);

  // Auto-select invoice from URL param (e.g. coming from review step payment gate)
  useEffect(() => {
    if (preselectedInvoiceId && invoices.length > 0 && !selectedInvoice) {
      const match = invoices.find((i: any) => i.id === preselectedInvoiceId);
      if (match) setSelectedInvoice(match);
    }
  }, [preselectedInvoiceId, invoices.length]);

  // Poll pending STK
  useEffect(() => {
    if (!pendingPayment || pendingPayment.status !== "PROCESSING") return;
    const interval = setInterval(async () => {
      try {
        const updated = await paymentsApi.pollMpesa(pendingPayment.reference ?? pendingPayment.id);
        if (updated.status === "SUCCESS") {
          setPendingPayment(null);
          setSuccessPayment(updated);
          setSelectedInvoice(null);
          qc.invalidateQueries({ queryKey: ["invoices", app?.id] });
          clearInterval(interval);
        } else if (updated.status === "FAILED" || updated.status === "CANCELLED") {
          toast.error("Payment was not completed. Please try again.");
          setPendingPayment(null);
          clearInterval(interval);
        }
      } catch { clearInterval(interval); }
    }, 3000);
    return () => clearInterval(interval);
  }, [pendingPayment]);

  // Dev simulate — single endpoint, no Paystack
  const simulateMutation = useMutation({
    mutationFn: () => paymentsApi.simulatePay(selectedInvoice!.id),
    onSuccess: (confirmed: any) => {
      setSelectedInvoice(null);
      setSuccessPayment({ ...confirmed, amountKes: selectedInvoice!.amountKes } as any);
      qc.invalidateQueries({ queryKey: ["invoices", app?.id] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (e: any) => toast.error(e.apiError ?? "Simulation failed"),
  });

  const mpesaMutation = useMutation({
    mutationFn: () => paymentsApi.initiateMpesa(selectedInvoice!.id, mpesaPhone),
    onSuccess: (payment) => setPendingPayment(payment),
    onError: (e: any) => toast.error(e.apiError ?? "Could not initiate payment"),
  });

  const cardMutation = useMutation({
    mutationFn: () => paymentsApi.initiateCard(selectedInvoice!.id),
    onSuccess: (data: any) => { window.location.href = data.authorizationUrl ?? data.redirectUrl; },
    onError: (e: any) => toast.error(e.apiError ?? "Could not initiate card payment"),
  });

  if (isLoading || invoicesLoading) {
    return (
      <div className="p-4 md:p-6 md:ml-56 space-y-3 max-w-xl">
        <Skeleton className="h-8 w-40" />
        {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  // STK pending screen
  if (pendingPayment) {
    return (
      <div className="p-4 md:p-6 md:ml-56 max-w-xl">
        <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center animate-pulse">
              <Clock className="h-8 w-8 text-gold-deep" />
            </div>
          </div>
          <h2 className="text-xl font-display font-semibold text-ink">Waiting for M-Pesa</h2>
          <p className="text-sm text-muted-foreground">
            A payment request of <strong>{formatKes(pendingPayment.amountKes ?? pendingPayment.amount ?? 0)}</strong> has been sent to{" "}
            <strong>{pendingPayment.mpesaPhone ?? mpesaPhone}</strong>.<br />
            Enter your M-Pesa PIN to complete the payment.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Checking payment status…
          </div>
          <Button variant="outline" size="sm" onClick={() => setPendingPayment(null)}>Cancel</Button>
        </div>
      </div>
    );
  }

  // Success screen
  if (successPayment) {
    return (
      <div className="p-4 md:p-6 md:ml-56 max-w-xl">
        <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <h2 className="text-xl font-display font-semibold text-ink">Payment Successful!</h2>
          <p className="text-sm text-muted-foreground">
            {formatKes(successPayment.amountKes ?? successPayment.amount ?? 0)} received.
            {successPayment.mpesaReceiptNumber && (
              <> M-Pesa receipt: <strong>{successPayment.mpesaReceiptNumber}</strong></>
            )}
          </p>
          <Button variant="gold" onClick={() => setSuccessPayment(null)} className="w-full">
            Done
          </Button>
        </div>
      </div>
    );
  }

  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
  const paidInvoices = invoices.filter((i) => i.status === "SUCCESS");

  return (
    <div className="p-4 md:p-6 md:ml-56 max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink mb-1">Payments</h1>
        <p className="text-sm text-muted-foreground">Your payment invoices and history.</p>
      </div>

      {!app && <Banner variant="info">Start an application to see payment invoices.</Banner>}

      {/* Pay invoice flow */}
      {selectedInvoice ? (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)}>← Back</Button>

          <FeeTable
            title={selectedInvoice.label}
            rows={[
              { label: selectedInvoice.label, amountKes: selectedInvoice.amountKes },
            ]}
            totalKes={selectedInvoice.amountKes}
          />

          <PaymentMethodPicker value={method} onChange={setMethod} />

          {method === "MPESA" && !IS_SIMULATE && (
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">M-Pesa phone number</Label>
              <Input
                id="mpesa-phone"
                type="tel"
                placeholder="0712345678"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
              />
            </div>
          )}

          {IS_SIMULATE && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <FlaskConical className="h-3.5 w-3.5 shrink-0" />
              Dev mode — payment will be confirmed instantly without Paystack.
            </div>
          )}

          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={
              IS_SIMULATE
                ? simulateMutation.isPending
                : (method === "MPESA" && !mpesaPhone) || mpesaMutation.isPending || cardMutation.isPending
            }
            onClick={() => {
              if (IS_SIMULATE) { simulateMutation.mutate(); return; }
              if (method === "MPESA") mpesaMutation.mutate(); else cardMutation.mutate();
            }}
          >
            {(IS_SIMULATE ? simulateMutation.isPending : mpesaMutation.isPending || cardMutation.isPending)
              ? "Processing…"
              : IS_SIMULATE
              ? `Simulate Payment · ${formatKes(selectedInvoice.amountKes)}`
              : `Pay ${formatKes(selectedInvoice.amountKes)}`}
          </Button>
        </div>
      ) : (
        <>
          {/* Pending invoices */}
          {pendingInvoices.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outstanding</h2>
              {pendingInvoices.map((inv) => (
                <div key={inv.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink text-sm">{inv.label}</p>
                    <p className="text-xs text-muted-foreground">{formatKes(inv.amountKes)}</p>
                    {inv.dueDate && <p className="text-xs text-warn">Due {formatDate(inv.dueDate)}</p>}
                  </div>
                  <Button size="sm" variant="gold" onClick={() => setSelectedInvoice(inv)}>
                    Pay Now
                  </Button>
                </div>
              ))}
            </section>
          )}

          {/* Paid invoices */}
          {paidInvoices.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paid</h2>
              {paidInvoices.map((inv) => (
                <div key={inv.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink text-sm">{inv.label}</p>
                    <p className="text-xs text-muted-foreground">{formatKes(inv.amountKes)}</p>
                    {inv.paidAt && <p className="text-xs text-muted-foreground">Paid {formatDate(inv.paidAt)}</p>}
                  </div>
                  <StatusChip variant="ok" label="Paid" />
                </div>
              ))}
            </section>
          )}

          {invoices.length === 0 && (
            <Banner variant="info">No payment invoices yet. They'll appear here as your application progresses.</Banner>
          )}
        </>
      )}
    </div>
  );
}
