"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession, useLogout } from "@/lib/auth/useSession";
import { applicationsApi } from "@/lib/api/applications";
import { paymentsApi } from "@/lib/api/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/brand/status-chip";
import { getInitials } from "@/lib/utils";
import { formatKes, formatDate } from "@/lib/format";
import { LogOut, User, Receipt } from "lucide-react";

const CHANNEL_LABEL: Record<string, string> = {
  Mpesa: "M-Pesa",
  mpesa: "M-Pesa",
  Card: "Card",
  card: "Card",
  Other: "Other",
  other: "Simulated",
};

const FEE_LABEL: Record<string, string> = {
  Application: "Application fee",
  Acceptance: "Acceptance fee",
  Admission: "Admission fee",
  Technology: "Technology fee",
  Medicals: "Medicals fee",
};

export default function ProfilePage() {
  const { user, isLoading } = useSession();
  const logout = useLogout();

  const { data: appList } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
    enabled: !!user,
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];

  const { data: rawPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["application-payments", app?.id],
    queryFn: () => paymentsApi.listPayments(app!.id),
    enabled: !!app?.id,
  });

  const payments: any[] = Array.isArray(rawPayments)
    ? rawPayments
    : (rawPayments as any)?.items ?? (rawPayments as any)?.data ?? [];

  const successPayments = payments.filter(
    (p) => (p.status ?? "").toLowerCase() === "success"
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 md:ml-56 space-y-3 max-w-xl">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 md:ml-56 max-w-xl space-y-5">
      <h1 className="text-2xl font-display font-semibold text-ink">Profile</h1>

      {/* Account card */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-navy flex items-center justify-center text-white font-semibold text-lg">
              {user ? getInitials(user.firstName, user.lastName) : <User className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-semibold text-ink">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-ink font-medium">{user?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone verified</span>
              <span className={user?.phoneVerified ? "text-success font-medium" : "text-warn font-medium"}>
                {user?.phoneVerified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="text-ink font-medium capitalize">{user?.role?.toLowerCase()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      {app && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gold-deep" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paymentsLoading ? (
              <div className="p-5 space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : successPayments.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-5 py-2.5 text-left font-medium">Fee</th>
                      <th className="px-4 py-2.5 text-left font-medium">Method</th>
                      <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                      <th className="px-4 py-2.5 text-left font-medium">Date</th>
                      <th className="px-5 py-2.5 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successPayments.map((p: any) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-ink">
                          {FEE_LABEL[p.feeCode] ?? p.feeCode ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {CHANNEL_LABEL[p.channel] ?? p.channel ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink tabular-nums">
                          {formatKes(p.amountGross ?? p.amountKes ?? 0)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {p.completedAt ? formatDate(p.completedAt) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <StatusChip variant="ok" label="Paid" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/20">
                      <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-ink">Total paid</td>
                      <td className="px-4 py-3 text-right font-bold text-ink tabular-nums">
                        {formatKes(successPayments.reduce((sum: number, p: any) => sum + (p.amountGross ?? p.amountKes ?? 0), 0))}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        className="w-full text-danger border-danger/30 hover:bg-danger/5"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
