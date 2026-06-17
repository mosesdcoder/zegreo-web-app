"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api/applications";
import { offerApi } from "@/lib/api/offer";
import { FeeTable } from "@/components/brand/fee-table";
import { Banner } from "@/components/brand/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { Download, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function OfferPage() {
  const qc = useQueryClient();

  const { data: appList, isLoading: appsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];

  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ["offer", app?.id],
    queryFn: () => offerApi.get(app!.id),
    enabled: !!app?.id,
  });

  const acceptMutation = useMutation({
    mutationFn: () => offerApi.accept(app!.id),
    onSuccess: (updated) => {
      qc.setQueryData(["offer", app?.id], updated);
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Offer accepted! Proceed to make your acceptance fee payment.");
    },
    onError: (e: any) => toast.error(e.apiError ?? "Could not accept offer"),
  });

  if (appsLoading || offerLoading) {
    return (
      <div className="p-4 md:p-6 md:ml-56 space-y-3 max-w-xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-4 md:p-6 md:ml-56 max-w-xl">
        <Banner variant="info" title="No offer yet">
          Your offer letter will appear here once our admissions team processes your application.
        </Banner>
      </div>
    );
  }

  const isExpired = new Date(offer.expiresAt) < new Date();
  const isAccepted = offer.status === "ACCEPTED";

  return (
    <div className="p-4 md:p-6 md:ml-56 max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink mb-1">Your Offer</h1>
        <p className="text-sm text-muted-foreground">
          Review the details of your admission offer below.
        </p>
      </div>

      {isExpired && offer.status !== "ACCEPTED" && (
        <Banner variant="warning" title="Offer expired">
          This offer expired on {formatDate(offer.expiresAt)}. Contact admissions to discuss your options.
        </Banner>
      )}

      {isAccepted && (
        <Banner variant="offer" title="Offer accepted">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Accepted on {offer.acceptedAt && formatDate(offer.acceptedAt)}.
            Proceed to <Link href="/payments" className="underline font-semibold">make your acceptance payment</Link>.
          </div>
        </Banner>
      )}

      {!isExpired && !isAccepted && (
        <Banner variant="info" title="Deadline">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Accept by <strong>{formatDate(offer.expiresAt)}</strong> to secure your place.
          </div>
        </Banner>
      )}

      {/* Fee breakdown */}
      <FeeTable
        title="Offer Fee Breakdown"
        rows={offer.fees.map((f) => ({
          label: f.label,
          amountKes: f.amountKes,
          isTechnologyFee: f.feeCode === "TECHNOLOGY_FEE",
        }))}
        totalKes={offer.totalKes}
      />

      {offer.conditions && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Conditions</h3>
          <p className="text-sm text-ink leading-relaxed">{offer.conditions}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {!isAccepted && !isExpired && (
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? "Processing…" : "Accept Offer"}
          </Button>
        )}

        {offer.letterUrl && (
          <Button variant="outline" size="lg" className="w-full" asChild>
            <a href={offer.letterUrl} download>
              <Download className="h-4 w-4 mr-2" />
              Download Offer Letter
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
