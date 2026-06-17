"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { StatusChip } from "@/components/brand/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatKes, formatDateShort } from "@/lib/format";
import { useState } from "react";
import { Download } from "lucide-react";

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const params: Record<string, string> = { page: String(page), perPage: "20" };
  if (statusFilter !== "ALL") params.status = statusFilter;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-payments", params],
    queryFn: () => paymentsApi.adminList(params),
  });

  const items: any[] = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);

  const totals = items.length > 0 ? items.reduce(
    (acc: any, p: any) => ({
      gross: acc.gross + (p.grossAmountKes ?? 0),
      providerFee: acc.providerFee + (p.providerFeeKes ?? 0),
      techFee: acc.techFee + (p.technologyFeeKes ?? 0),
      net: acc.net + (p.netToSchoolKes ?? 0),
    }),
    { gross: 0, providerFee: 0, techFee: 0, net: 0 }
  ) : null;

  const handleExport = () => {
    const headers = ["Reference", "Method", "Gross (KES)", "Provider Fee (KES)", "Technology Fee (KES)", "Net to School (KES)", "Status", "Date"];
    const rows = items.map((p: any) => [
      p.mpesaReceiptNumber ?? p.cardReference ?? p.id ?? "",
      p.method ?? "",
      p.grossAmountKes ?? p.amountGross ?? "",
      p.providerFeeKes ?? p.providerFee ?? "",
      p.technologyFeeKes ?? p.technologyFee ?? "",
      p.netToSchoolKes ?? p.amountNetToSchool ?? "",
      p.status ?? "",
      p.completedAt ?? p.createdAt ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "payments.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-semibold text-ink">Payments & Reconciliation</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="SUCCESS">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      )}
      {error && <Banner variant="warning">Failed to load payments.</Banner>}

      {!isLoading && !error && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Provider Fee</TableHead>
                <TableHead className="text-right text-gold-deep">Technology Fee</TableHead>
                <TableHead className="text-right">Net to School</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No payments found.</TableCell>
                </TableRow>
              )}
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">
                    {p.mpesaReceiptNumber ?? p.cardReference ?? p.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-sm">{p.method}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{formatKes(p.grossAmountKes)}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-muted-foreground">{formatKes(p.providerFeeKes)}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-gold-deep">{formatKes(p.technologyFeeKes)}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-semibold">{formatKes(p.netToSchoolKes)}</TableCell>
                  <TableCell>
                    <StatusChip
                      variant={p.status === "SUCCESS" ? "ok" : p.status === "PENDING" ? "pending" : "bad"}
                      label={p.status}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.completedAt ? formatDateShort(p.completedAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {totals && items.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">Totals (this page)</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatKes(totals.gross)}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{formatKes(totals.providerFee)}</TableCell>
                  <TableCell className="text-right text-gold-deep font-semibold tabular-nums">{formatKes(totals.techFee)}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">{formatKes(totals.net)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
