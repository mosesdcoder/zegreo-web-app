import { cn } from "@/lib/utils";
import type { DocumentStatus, ApplicationStatus } from "@/lib/types";

type ChipVariant = "ok" | "pending" | "bad" | "todo" | "info";

const VARIANT_STYLES: Record<ChipVariant, string> = {
  ok: "bg-success/15 text-success border-success/20",
  pending: "bg-warn/15 text-warn border-warn/20",
  bad: "bg-danger/15 text-danger border-danger/20",
  todo: "bg-canvas text-muted-foreground border-border",
  info: "bg-gold/15 text-gold-deep border-gold/20",
};

interface StatusChipProps {
  variant: ChipVariant;
  label: string;
  className?: string;
}

export function StatusChip({ variant, label, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

export function docStatusChip(status: DocumentStatus) {
  const map: Record<DocumentStatus, { variant: ChipVariant; label: string }> = {
    VERIFIED: { variant: "ok", label: "Verified" },
    PENDING: { variant: "pending", label: "Pending Review" },
    REJECTED: { variant: "bad", label: "Rejected" },
    NOT_UPLOADED: { variant: "todo", label: "Not Uploaded" },
  };
  return map[status] ?? { variant: "todo", label: status };
}

export function appStatusChip(status: ApplicationStatus) {
  const map: Record<ApplicationStatus, { variant: ChipVariant; label: string }> = {
    DRAFT: { variant: "todo", label: "Draft" },
    SUBMITTED: { variant: "pending", label: "Submitted" },
    UNDER_REVIEW: { variant: "info", label: "Under Review" },
    DOCUMENTS_REQUIRED: { variant: "bad", label: "Docs Required" },
    DOCUMENTS_SUBMITTED: { variant: "pending", label: "Docs Submitted" },
    OFFER_MADE: { variant: "info", label: "Offer Made" },
    OFFER_ACCEPTED: { variant: "ok", label: "Offer Accepted" },
    ENROLLED: { variant: "ok", label: "Enrolled" },
    REJECTED: { variant: "bad", label: "Rejected" },
    WITHDRAWN: { variant: "todo", label: "Withdrawn" },
  };
  return map[status] ?? { variant: "todo", label: status };
}
