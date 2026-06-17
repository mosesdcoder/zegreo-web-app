"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { applicationsApi } from "@/lib/api/applications";
import { documentsApi } from "@/lib/api/documents";
import { DocRow } from "@/components/brand/doc-row";
import { StatusChip, appStatusChip } from "@/components/brand/status-chip";
import { Banner } from "@/components/brand/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { formatDate, formatDateShort } from "@/lib/format";
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Gift } from "lucide-react";
import Link from "next/link";
import type { Document } from "@/lib/types";

type DialogType = "verify" | "reject-doc" | "resubmit" | "make-offer" | "reject-app" | "request-info" | null;

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [dialog, setDialog] = useState<DialogType>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [reason, setReason] = useState("");
  const [offerExpiry, setOfferExpiry] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [offerConditions, setOfferConditions] = useState("");

  const { data: app, isLoading } = useQuery({
    queryKey: ["admin-app", params.id],
    queryFn: () => applicationsApi.adminGet(params.id),
  });

  const { data: docs } = useQuery({
    queryKey: ["admin-docs", params.id],
    queryFn: () => documentsApi.list(params.id),
    enabled: !!params.id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-app", params.id] });
    qc.invalidateQueries({ queryKey: ["admin-docs", params.id] });
  };

  const verifyDocMutation = useMutation({
    mutationFn: () => documentsApi.verify(params.id, selectedDoc!.id),
    onSuccess: () => { toast.success("Document verified"); invalidate(); setDialog(null); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  const rejectDocMutation = useMutation({
    mutationFn: () => documentsApi.reject(params.id, selectedDoc!.id, reason),
    onSuccess: () => { toast.success("Document rejected"); invalidate(); setDialog(null); setReason(""); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  const resubmitDocMutation = useMutation({
    mutationFn: () => documentsApi.requestResubmit(params.id, selectedDoc!.id, reason),
    onSuccess: () => { toast.success("Resubmission requested"); invalidate(); setDialog(null); setReason(""); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  const makeOfferMutation = useMutation({
    mutationFn: () => applicationsApi.makeOffer(params.id, { expiresAt: offerExpiry, conditions: offerConditions || undefined }),
    onSuccess: () => { toast.success("Offer made!"); invalidate(); setDialog(null); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  const rejectAppMutation = useMutation({
    mutationFn: () => applicationsApi.reject(params.id, reason),
    onSuccess: () => { toast.success("Application rejected"); invalidate(); setDialog(null); setReason(""); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  const requestInfoMutation = useMutation({
    mutationFn: () => applicationsApi.requestInfo(params.id, reason),
    onSuccess: () => { toast.success("Request sent"); invalidate(); setDialog(null); setReason(""); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!app) return <Banner variant="warning">Application not found.</Banner>;

  // API returns flat fields + raw JSON strings
  const personal = (() => { try { return app.personalJson ? JSON.parse(app.personalJson) : null; } catch { return null; } })();
  const education: any[] = (() => { try { return app.educationHistoryJson ? JSON.parse(app.educationHistoryJson) : []; } catch { return []; } })();
  const nextOfKin = (() => { try { return app.nextOfKinJson ? JSON.parse(app.nextOfKinJson) : null; } catch { return null; } })();

  // Derive display name: prefer parsed personal, fall back to flat applicantName
  const firstName = personal?.firstName ?? app.applicantName?.split(" ")[0] ?? "";
  const lastName = personal?.lastName ?? app.applicantName?.split(" ").slice(1).join(" ") ?? "";

  const chip = appStatusChip(app.status);
  const canDecide = ["UNDER_REVIEW", "DOCUMENTS_SUBMITTED", "UnderReview", "DocsVerified"].includes(app.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/applications"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">
            {firstName} {lastName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusChip variant={chip.variant} label={chip.label} />
            <span className="text-sm text-muted-foreground">#{app.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Applicant details */}
        <Section title="Personal Details">
          <Row label="Name" value={`${firstName} ${lastName}`.trim() || undefined} />
          <Row label="DOB" value={personal?.dateOfBirth ? formatDate(personal.dateOfBirth) : undefined} />
          <Row label="Gender" value={personal?.gender} />
          <Row label="National ID" value={personal?.nationalId} />
          <Row label="Email" value={personal?.email ?? app.email} />
          <Row label="Phone" value={personal?.phone ?? app.phone} />
          <Row label="County" value={personal?.county} />
        </Section>

        {/* Program */}
        <Section title="Program & Intake">
          <Row label="Program" value={app.programName ?? app.program?.name} />
          <Row label="Intake" value={app.intakeName ?? app.intake?.label} />
          <Row label="Applied" value={app.submittedAt ? formatDateShort(app.submittedAt) : app.createdAt ? formatDateShort(app.createdAt) : undefined} />
          {app.admissionNumber && <Row label="Admission No." value={app.admissionNumber} />}
        </Section>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education History">
          {education.map((e: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-ink font-medium">{e.institution} — {e.qualification}</span>
              <span className="text-muted-foreground">{e.yearCompleted}{e.grade && ` · ${e.grade}`}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Documents */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</h2>
        {(() => { const d = docs ?? app.documents ?? []; return d.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded yet.</p> : null; })()}
        {(docs ?? app.documents ?? []).map((doc: any) => (
          <div key={doc.id} className="relative">
            <DocRow doc={doc} />
            {doc.status === "PENDING" && (
              <div className="flex gap-2 mt-1.5 ml-9">
                <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/5"
                  onClick={() => { setSelectedDoc(doc); setDialog("verify"); }}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verify
                </Button>
                <Button size="sm" variant="outline" className="text-danger border-danger/30 hover:bg-danger/5"
                  onClick={() => { setSelectedDoc(doc); setDialog("reject-doc"); }}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
                <Button size="sm" variant="outline"
                  onClick={() => { setSelectedDoc(doc); setDialog("resubmit"); }}>
                  Request Resubmit
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decision panel */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="font-display font-semibold text-ink">Decision</h2>
        {!canDecide && (
          <p className="text-sm text-muted-foreground">
            Decisions can be made when the application is Under Review or Documents Submitted.
          </p>
        )}
        {canDecide && (
          <div className="flex flex-wrap gap-3">
            <Button variant="gold" onClick={() => setDialog("make-offer")}>
              <Gift className="h-4 w-4 mr-2" /> Make Offer
            </Button>
            <Button variant="outline" onClick={() => setDialog("request-info")}>
              <MessageSquare className="h-4 w-4 mr-2" /> Request Info
            </Button>
            <Button variant="outline" className="text-danger border-danger/30 hover:bg-danger/5"
              onClick={() => setDialog("reject-app")}>
              <XCircle className="h-4 w-4 mr-2" /> Reject Application
            </Button>
          </div>
        )}
      </div>

      {/* --- Dialogs --- */}

      {/* Verify doc */}
      <Dialog open={dialog === "verify"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Verify Document</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mark <strong>{selectedDoc?.label}</strong> as verified?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="gold" onClick={() => verifyDocMutation.mutate()} disabled={verifyDocMutation.isPending}>
              {verifyDocMutation.isPending ? "Verifying…" : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject doc */}
      <Dialog open={dialog === "reject-doc"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Document</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason (shown to applicant)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectDocMutation.mutate()} disabled={!reason || rejectDocMutation.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request resubmit */}
      <Dialog open={dialog === "resubmit"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Resubmission</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => resubmitDocMutation.mutate()} disabled={!reason || resubmitDocMutation.isPending}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make offer */}
      <Dialog open={dialog === "make-offer"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Make Offer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Offer expiry date</Label>
              <Input type="date" value={offerExpiry} onChange={(e) => setOfferExpiry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Conditions (optional)</Label>
              <Textarea value={offerConditions} onChange={(e) => setOfferConditions(e.target.value)} rows={3} placeholder="e.g. Subject to verification of original certificates" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="gold" onClick={() => makeOfferMutation.mutate()} disabled={makeOfferMutation.isPending}>
              {makeOfferMutation.isPending ? "Sending…" : "Send Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject app */}
      <Dialog open={dialog === "reject-app"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason (shown to applicant)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => rejectAppMutation.mutate()} disabled={!reason || rejectAppMutation.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request info */}
      <Dialog open={dialog === "request-info"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Information</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Message to applicant</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={() => requestInfoMutation.mutate()} disabled={!reason || requestInfoMutation.isPending}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-2.5 bg-canvas border-b">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-ink font-medium text-right">{value}</span>
    </div>
  );
}
