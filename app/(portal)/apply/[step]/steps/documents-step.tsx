"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applicationsApi } from "@/lib/api/applications";
import { documentsApi } from "@/lib/api/documents";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/brand/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Upload, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// The 3 docs we collect at application time (MedicalReport comes later after offer)
const REQUIRED_SLOTS = [
  {
    type: "NationalIdOrPassport",
    label: "National ID or Passport",
    hint: "Clear scan of your National ID (front & back) or passport bio page. PDF, JPG or PNG.",
  },
  {
    type: "AcademicCertificate",
    label: "Academic Certificate",
    hint: "Your most recent academic certificate (KCSE or equivalent). PDF, JPG or PNG.",
  },
  {
    type: "PassportPhoto",
    label: "Passport Photo",
    hint: "Recent passport-sized photograph on a white background. JPG or PNG.",
  },
];

// Backend type strings → match what we send in the upload
type SlotType = typeof REQUIRED_SLOTS[number];

export function DocumentsStep({ applicationId }: { applicationId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<SlotType | null>(null);

  const { data: appList, isLoading: appsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];
  const appId = applicationId ?? app?.id;

  const { data: rawDocs, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", appId],
    queryFn: () => documentsApi.list(appId!),
    enabled: !!appId,
  });
  const docs: any[] = Array.isArray(rawDocs) ? rawDocs : [];

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) =>
      documentsApi.upload(appId!, activeSlot!.type, file),
    onSuccess: () => {
      toast.success("Document uploaded!");
      qc.invalidateQueries({ queryKey: ["documents", appId] });
      setActiveSlot(null);
    },
    onError: (e: any) => toast.error(e.apiError ?? "Upload failed. Please try again."),
  });

  if (appsLoading || docsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  // Merge uploaded docs with required slots
  const slots = REQUIRED_SLOTS.map((slot) => {
    const uploaded = docs.find(
      (d: any) =>
        (d.type ?? "").toLowerCase() === slot.type.toLowerCase() ||
        (d.documentType ?? "").toLowerCase() === slot.type.toLowerCase()
    );
    return { slot, uploaded };
  });

  const uploadedCount = slots.filter((s) => s.uploaded).length;
  const allUploaded = uploadedCount === REQUIRED_SLOTS.length;

  return (
    <div className="space-y-5">
      <Banner variant="info" title="Upload your documents">
        Upload clear, readable files before submitting. You can also upload later from the Documents page, but doing it now speeds up your review.
      </Banner>

      <div className="space-y-3">
        {slots.map(({ slot, uploaded }) => {
          const status: string = uploaded
            ? (uploaded.status ?? "PENDING").toUpperCase()
            : "NOT_UPLOADED";

          const isVerified = status === "VERIFIED";
          const isRejected = status === "REJECTED";
          const isPending = status === "PENDING";
          const isUploaded = !!uploaded && !isRejected;

          const Icon = isVerified
            ? CheckCircle
            : isRejected
            ? XCircle
            : isPending
            ? Clock
            : FileText;

          const iconColor = isVerified
            ? "text-success"
            : isRejected
            ? "text-danger"
            : isPending
            ? "text-warn"
            : "text-muted-foreground";

          return (
            <div
              key={slot.type}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border bg-card",
                isRejected && "border-danger/30 bg-danger/5",
                isVerified && "border-success/30 bg-success/5"
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor)} />

              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-medium text-sm text-ink">
                  {slot.label}
                  <span className="ml-1 text-danger text-xs">*</span>
                </p>
                {!isUploaded && (
                  <p className="text-xs text-muted-foreground">{slot.hint}</p>
                )}
                {isRejected && uploaded?.rejectionReason && (
                  <p className="mt-1.5 text-xs text-danger bg-danger/10 rounded px-2 py-1">
                    <span className="font-semibold">Reason: </span>
                    {uploaded.rejectionReason}
                  </p>
                )}
                {uploaded?.uploadedAt && (
                  <p className="text-xs text-muted-foreground">
                    Uploaded{" "}
                    {new Date(uploaded.uploadedAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isVerified && (
                  <span className="text-xs font-semibold text-success">Verified</span>
                )}
                {isPending && !isRejected && (
                  <span className="text-xs font-semibold text-warn">Under review</span>
                )}
                {(!isUploaded || isRejected) && (
                  <button
                    onClick={() => setActiveSlot(slot)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-gold-deep transition-colors px-3 py-1.5 rounded-md border border-navy/20 hover:border-gold/30 bg-card"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {isRejected ? "Re-upload" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {uploadedCount > 0 && !allUploaded && (
        <p className="text-xs text-muted-foreground text-center">
          {uploadedCount} of {REQUIRED_SLOTS.length} uploaded — you can upload the rest later.
        </p>
      )}

      {/* Upload dialog */}
      <Dialog open={!!activeSlot} onOpenChange={(o) => !o && setActiveSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {activeSlot?.label}</DialogTitle>
            <DialogDescription>{activeSlot?.hint}</DialogDescription>
          </DialogHeader>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate({ file });
              // reset so re-selecting same file still triggers onChange
              e.target.value = "";
            }}
          />
          <Button
            variant="gold"
            className="w-full"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? "Uploading…" : "Choose File"}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => router.push("/apply/kin")} className="flex-1">
          Back
        </Button>
        <Button
          variant="gold"
          className="flex-1"
          onClick={() => router.push("/apply/review")}
        >
          {allUploaded ? "Continue →" : "Skip for now →"}
        </Button>
      </div>
    </div>
  );
}
