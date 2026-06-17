import { FileText, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { StatusChip, docStatusChip } from "./status-chip";
import { cn } from "@/lib/utils";
import type { Document } from "@/lib/types";

interface DocRowProps {
  doc: Document;
  onUpload?: (doc: Document) => void;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID",
  PASSPORT_PHOTO: "Passport Photo",
  KCSE_CERTIFICATE: "KCSE Certificate",
  KCSE_RESULT_SLIP: "KCSE Result Slip",
  BIRTH_CERTIFICATE: "Birth Certificate",
  OTHER: "Supporting Document",
};

export function DocRow({ doc, onUpload, className }: DocRowProps) {
  const chip = docStatusChip(doc.status);

  const Icon =
    doc.status === "VERIFIED"
      ? CheckCircle
      : doc.status === "REJECTED"
      ? XCircle
      : doc.status === "PENDING"
      ? Clock
      : FileText;

  const iconColor =
    doc.status === "VERIFIED"
      ? "text-success"
      : doc.status === "REJECTED"
      ? "text-danger"
      : doc.status === "PENDING"
      ? "text-warn"
      : "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border bg-card",
        doc.status === "REJECTED" && "border-danger/30 bg-danger/5",
        className
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColor)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-medium text-sm text-ink">
            {doc.label || TYPE_LABELS[doc.type] || doc.type}
            {doc.isMandatory && (
              <span className="ml-1 text-danger text-xs">*</span>
            )}
          </span>
          <StatusChip variant={chip.variant} label={chip.label} />
        </div>

        {doc.rejectionReason && (
          <p className="mt-1.5 text-xs text-danger bg-danger/10 rounded px-2 py-1">
            <span className="font-semibold">Reason: </span>
            {doc.rejectionReason}
          </p>
        )}

        {doc.uploadedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Uploaded{" "}
            {new Date(doc.uploadedAt).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {onUpload && (doc.status === "NOT_UPLOADED" || doc.status === "REJECTED") && (
        <button
          onClick={() => onUpload(doc)}
          className="flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-gold-deep transition-colors shrink-0 px-3 py-1.5 rounded-md border border-navy/20 hover:border-gold/30 bg-card"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      )}
    </div>
  );
}
