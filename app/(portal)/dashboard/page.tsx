"use client";

import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api/applications";
import { StatusLadder } from "@/components/brand/status-ladder";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/brand/status-chip";
import { useSession } from "@/lib/auth/useSession";
import { GraduationCap, Calendar } from "lucide-react";
import Link from "next/link";
import type { ApplicationStatus } from "@/lib/types";

// Normalise status from backend ("Draft" → "DRAFT")
function normaliseStatus(s: string): ApplicationStatus {
  return s.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase() as ApplicationStatus;
}

export default function DashboardPage() {
  const { user } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });

  const applications = Array.isArray(data) ? data : [];
  // Show the most recent non-withdrawn application first
  const application = applications[0] as any;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 md:ml-56 space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 md:ml-56 max-w-2xl">
        <Banner variant="warning" title="Could not load your application">
          Please refresh the page or contact support if the issue persists.
        </Banner>
      </div>
    );
  }

  const firstName = user?.firstName || (user as any)?.fullName?.split(" ")[0] || "there";

  if (!application) {
    return (
      <div className="p-4 md:p-6 md:ml-56 max-w-lg">
        <h1 className="text-3xl font-display font-semibold text-ink mb-2">
          Welcome, {firstName}!
        </h1>
        <p className="text-muted-foreground mb-6">
          You haven't started an application yet. Begin your journey by selecting a program.
        </p>
        <Button asChild variant="gold" size="lg">
          <Link href="/apply/program">Start Application</Link>
        </Button>
      </div>
    );
  }

  const rawStatus: string = application.status ?? "Draft";
  const status = normaliseStatus(rawStatus);
  const programName: string = application.programName ?? application.program?.name ?? "—";
  const intakeName: string = application.intakeName ?? application.intake?.label ?? "";
  const whatNext: string = application.whatNext ?? "";

  // Resume at the first incomplete wizard step based on saved progress
  function resumeStep(app: any): string {
    if (!app?.personalJson) return "/apply/personal";
    if (!app?.educationHistoryJson) return "/apply/education";
    if (!app?.nextOfKinJson) return "/apply/kin";
    return "/apply/documents";
  }
  const continueHref = resumeStep(application);

  return (
    <div className="p-4 md:p-6 md:ml-56 max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-ink mb-1">
          Welcome back, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">Track your application progress below.</p>
      </div>

      {/* Program card + CTA */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-gold-deep" />
                <span className="text-xs font-semibold text-gold-deep uppercase tracking-wide">
                  Application
                </span>
              </div>
              <h2 className="font-display font-semibold text-ink text-lg leading-tight">
                {programName}
              </h2>
              {intakeName && (
                <div className="flex items-center gap-1 mt-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {intakeName}
                </div>
              )}
            </div>
            <StatusChip
              variant={
                status === "ENROLLED" ? "ok"
                : status === "REJECTED" || status === "WITHDRAWN" ? "bad"
                : status === "OFFER_MADE" || status === "OFFER_ACCEPTED" ? "info"
                : status === "DRAFT" ? "todo"
                : "pending"
              }
              label={rawStatus}
            />
          </div>

          {/* CTA lives inside the card */}
          {(() => {
            const s = rawStatus.toLowerCase();
            if (s === "draft") return (
              <Button asChild variant="gold" size="lg" className="w-full">
                <Link href={continueHref}>Continue Application →</Link>
              </Button>
            );
            if (s === "documentsrequired" || s === "documents_required" || s === "needsinfo" || s === "needs_info") return (
              <Button asChild variant="gold" size="lg" className="w-full">
                <Link href="/documents">Upload Documents →</Link>
              </Button>
            );
            if (s === "offermade" || s === "offer_made") return (
              <Button asChild variant="gold" size="lg" className="w-full">
                <Link href="/offer">View Offer →</Link>
              </Button>
            );
            if (s === "offeraccepted" || s === "offer_accepted") return (
              <Button asChild variant="gold" size="lg" className="w-full">
                <Link href="/payments">Make Payment →</Link>
              </Button>
            );
            return null;
          })()}
        </CardContent>
      </Card>

      {/* What's next banner */}
      {whatNext && (
        <Banner variant="info" title="What's next">
          {whatNext}
        </Banner>
      )}

      {/* Offer banner */}
      {status === "OFFER_MADE" && (
        <Banner variant="offer" title="You have an offer!">
          Review your offer and accept to secure your place.{" "}
          <Link href="/offer" className="font-semibold underline">View offer →</Link>
        </Banner>
      )}

      {/* Documents required / needs info banners */}
      {status === "DOCUMENTS_REQUIRED" && (
        <Banner variant="warning" title="Documents required">
          Please upload the required documents to continue your application.{" "}
          <Link href="/documents" className="font-semibold underline">Upload documents →</Link>
        </Banner>
      )}
      {(rawStatus === "NeedsInfo" || status === "NEEDS_INFO") && (
        <Banner variant="warning" title="Additional information requested">
          {whatNext || "Our team has reviewed your application and needs additional documents or information."}
          {" "}<Link href="/documents" className="font-semibold underline">Go to Documents →</Link>
        </Banner>
      )}

      {/* Status ladder */}
      <StatusLadder
        currentStatus={status}
        statusHistory={application.statusHistory ?? []}
      />

      {/* CTA */}
      {(() => {
        const s = rawStatus.toLowerCase();
        if (s === "draft") return (
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href={continueHref}>Continue Application →</Link>
          </Button>
        );
        if (s === "documentsrequired" || s === "documents_required") return (
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href="/documents">Upload Documents →</Link>
          </Button>
        );
        if (s === "offermade" || s === "offer_made") return (
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href="/offer">View Offer →</Link>
          </Button>
        );
        if (s === "offeraccepted" || s === "offer_accepted") return (
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href="/payments">Make Payment →</Link>
          </Button>
        );
        return null;
      })()}
    </div>
  );
}
