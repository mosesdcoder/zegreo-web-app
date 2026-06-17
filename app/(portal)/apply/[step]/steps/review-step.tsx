"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applicationsApi } from "@/lib/api/applications";
import { Banner } from "@/components/brand/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export function ReviewStep({ applicationId }: { applicationId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: appList, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];
  const appId = applicationId ?? app?.id;

  const [paymentGate, setPaymentGate] = useState<{ invoiceId: string; amount: number; message: string } | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => applicationsApi.submit(appId!),
    onSuccess: (result: any) => {
      // Backend returns invoice details when the application fee must be paid first
      if (result?.invoiceId) {
        setPaymentGate({ invoiceId: result.invoiceId, amount: result.amount, message: result.message });
        return;
      }
      // Full submission succeeded
      qc.setQueryData(["my-applications"], (old: any) =>
        Array.isArray(old) ? old.map((a: any) => a.id === result.id ? result : a) : old
      );
      toast.success("Application submitted!");
      router.push("/dashboard");
    },
    onError: (e: any) => toast.error(e.apiError ?? "Submission failed"),
  });

  if (isLoading || !app) return <Skeleton className="h-64 w-full rounded-xl" />;

  // API returns flat fields + JSON strings — parse them
  const personal = (() => { try { return app.personalJson ? JSON.parse(app.personalJson) : null; } catch { return null; } })();
  const education: any[] = (() => { try { return app.educationHistoryJson ? JSON.parse(app.educationHistoryJson) : []; } catch { return []; } })();
  const nextOfKin = (() => { try { return app.nextOfKinJson ? JSON.parse(app.nextOfKinJson) : null; } catch { return null; } })();

  const programName: string = app.programName ?? app.program?.name ?? "—";
  const intakeName: string = app.intakeName ?? app.intake?.label ?? "—";

  return (
    <div className="space-y-5">
      <Banner variant="info" title="Review your application">
        Make sure all details are correct before submitting. You won't be able to edit after submission.
      </Banner>

      {/* Program */}
      <Section title="Program & Intake">
        <Row label="Program" value={programName} />
        <Row label="Intake" value={intakeName} />
      </Section>

      {/* Personal */}
      <Section title="Personal Details">
        <Row label="Name" value={personal ? `${personal.firstName ?? ""} ${personal.lastName ?? ""}`.trim() || undefined : undefined} />
        <Row label="Date of birth" value={personal?.dateOfBirth ? formatDate(personal.dateOfBirth) : undefined} />
        <Row label="Gender" value={personal?.gender} />
        <Row label="National ID" value={personal?.nationalId} />
        <Row label="Nationality" value={personal?.nationality} />
        <Row label="County" value={personal?.county} />
        <Row label="Email" value={personal?.email} />
        <Row label="Phone" value={personal?.phone} />
      </Section>

      {/* Education */}
      <Section title="Education History">
        {education.length === 0 && <p className="text-sm text-muted-foreground">No entries.</p>}
        {education.map((e: any, i: number) => (
          <div key={i} className="border-b last:border-0 pb-2 last:pb-0">
            <p className="font-medium text-sm">{e.institution}</p>
            <p className="text-xs text-muted-foreground">{e.qualification} · {e.yearCompleted}{e.grade && ` · ${e.grade}`}</p>
          </div>
        ))}
      </Section>

      {/* Next of kin */}
      <Section title="Next of Kin">
        <Row label="Name" value={nextOfKin?.name} />
        <Row label="Relationship" value={nextOfKin?.relationship} />
        <Row label="Phone" value={nextOfKin?.phone} />
        {nextOfKin?.email && <Row label="Email" value={nextOfKin.email} />}
      </Section>

      {paymentGate && (
        <div className="rounded-xl border border-gold/40 bg-gold-soft/30 p-5 space-y-3">
          <div>
            <p className="font-semibold text-ink">Application Fee Required</p>
            <p className="text-sm text-muted-foreground mt-1">{paymentGate.message}</p>
            <p className="text-2xl font-bold text-ink mt-2">
              KES {paymentGate.amount.toLocaleString()}
            </p>
          </div>
          <Button
            variant="gold"
            className="w-full"
            onClick={() => router.push(`/payments?invoiceId=${paymentGate.invoiceId}&appId=${appId}&returnTo=/apply/review`)}
          >
            Pay Application Fee →
          </Button>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/apply/documents")} className="flex-1">Back</Button>
        <Button
          variant="gold"
          className="flex-1"
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || !!paymentGate}
        >
          {submitMutation.isPending ? "Submitting…" : "Submit Application"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By submitting you confirm all information is accurate.
      </p>
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
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-ink font-medium text-right">{value}</span>
    </div>
  );
}
