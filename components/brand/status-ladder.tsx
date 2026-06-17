import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, Circle } from "lucide-react";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_ORDER: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "DOCUMENTS_REQUIRED",
  "DOCUMENTS_SUBMITTED",
  "OFFER_MADE",
  "OFFER_ACCEPTED",
  "ENROLLED",
];

const STEP_LABELS: Record<string, string> = {
  DRAFT: "Application Draft",
  SUBMITTED: "Application Submitted",
  UNDER_REVIEW: "Under Review",
  DOCUMENTS_REQUIRED: "Documents Required",
  DOCUMENTS_SUBMITTED: "Documents Submitted",
  OFFER_MADE: "Offer Made",
  OFFER_ACCEPTED: "Offer Accepted",
  ENROLLED: "Enrolled",
};

const NEXT_STEP_TEXT: Partial<Record<ApplicationStatus, string>> = {
  DRAFT: "Complete and submit your application to proceed.",
  SUBMITTED: "Your application is being reviewed. We'll notify you of any updates.",
  UNDER_REVIEW: "Our admissions team is reviewing your application.",
  DOCUMENTS_REQUIRED: "Please upload the required documents to continue.",
  DOCUMENTS_SUBMITTED: "Your documents are being verified.",
  OFFER_MADE: "You have an offer! Review and accept to secure your place.",
  OFFER_ACCEPTED: "Pay the acceptance fee to confirm your enrollment.",
  ENROLLED: "Welcome to Zogreo! Check your email for next steps.",
};

type StepState = "done" | "current" | "todo";

interface StatusLadderProps {
  currentStatus: ApplicationStatus;
  statusHistory?: { status: ApplicationStatus; timestamp: string }[];
  className?: string;
  compact?: boolean;
}

export function StatusLadder({
  currentStatus,
  statusHistory = [],
  className,
  compact = false,
}: StatusLadderProps) {
  if (currentStatus === "REJECTED" || currentStatus === "WITHDRAWN") {
    return (
      <div className={cn("rounded-xl border bg-card p-4", className)}>
        <div className="flex items-center gap-3 text-danger">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              Application {currentStatus === "REJECTED" ? "Rejected" : "Withdrawn"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Contact admissions for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  const steps = STATUS_ORDER.map((status, idx) => {
    let state: StepState;
    if (idx < currentIdx) state = "done";
    else if (idx === currentIdx) state = "current";
    else state = "todo";

    const historyEntry = statusHistory.find((h) => h.status === status);

    return { status, state, timestamp: historyEntry?.timestamp };
  });

  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <h3 className="font-display font-semibold text-ink mb-4 text-base">
        Application Progress
      </h3>

      {/* Horizontal track */}
      <ol className="flex items-start gap-0">
        {steps.map(({ status, state, timestamp }, idx) => (
          <li key={status} className="flex-1 flex flex-col items-center min-w-0">
            {/* Connector + node row */}
            <div className="flex items-center w-full">
              {/* Left connector */}
              <div
                className={cn(
                  "flex-1 h-0.5 transition-colors",
                  idx === 0 && "invisible",
                  idx > 0 && (steps[idx - 1].state === "done" || state === "done" || state === "current")
                    ? "bg-success"
                    : "bg-border"
                )}
              />
              {/* Node */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  state === "done" && "bg-success border-success",
                  state === "current" && "bg-gold border-gold shadow-sm shadow-gold/30",
                  state === "todo" && "bg-card border-border"
                )}
              >
                {state === "done" ? (
                  <Check className="h-4 w-4 text-white" />
                ) : state === "current" ? (
                  <Clock className="h-4 w-4 text-white" />
                ) : (
                  <Circle className="h-3 w-3 text-border" />
                )}
              </div>
              {/* Right connector */}
              <div
                className={cn(
                  "flex-1 h-0.5 transition-colors",
                  idx === steps.length - 1 && "invisible",
                  state === "done" ? "bg-success" : "bg-border"
                )}
              />
            </div>

            {/* Label */}
            <p
              className={cn(
                "mt-2 text-center text-[10px] font-medium leading-tight px-0.5",
                state === "done" && "text-success",
                state === "current" && "text-gold-deep font-semibold",
                state === "todo" && "text-muted-foreground"
              )}
            >
              {STEP_LABELS[status]}
            </p>
            {timestamp && !compact && (
              <p className="text-[9px] text-muted-foreground mt-0.5 text-center">
                {new Date(timestamp).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            )}
          </li>
        ))}
      </ol>

      {/* Next step CTA */}
      {NEXT_STEP_TEXT[currentStatus] && (
        <div className="mt-4 rounded-lg bg-gold-soft/40 border border-gold/20 p-3">
          <p className="text-xs font-semibold text-gold-deep uppercase tracking-wide mb-1">
            What's next
          </p>
          <p className="text-sm text-ink">{NEXT_STEP_TEXT[currentStatus]}</p>
        </div>
      )}
    </div>
  );
}
