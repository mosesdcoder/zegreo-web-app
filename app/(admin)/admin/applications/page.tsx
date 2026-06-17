"use client";

import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api/applications";
import { StatusChip, appStatusChip } from "@/components/brand/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { formatDateShort } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";

/** Application fee is paid once status moves past Draft */
function hasAppFeePaid(status: string): boolean {
  return !["Draft", "DRAFT", ""].includes(status ?? "");
}

const STATUSES: ApplicationStatus[] = [
  "SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_REQUIRED", "DOCUMENTS_SUBMITTED",
  "OFFER_MADE", "OFFER_ACCEPTED", "ENROLLED", "REJECTED",
];

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), perPage: "20" };
  if (statusFilter !== "ALL") params.status = statusFilter;
  if (search) params.search = search;

  const { data: raw, isLoading, error } = useQuery({
    queryKey: ["admin-applications", params],
    queryFn: () => applicationsApi.adminList(params),
  });

  // Normalise: API returns { total, page, items } (envelope already unwrapped by client)
  const rows: any[] = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
  const total: number = Array.isArray(raw) ? raw.length : (raw?.total ?? rows.length);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-semibold text-ink">Applications Queue</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name, email…"
          className="max-w-xs"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}

      {error && <Banner variant="warning">Failed to load applications.</Banner>}

      {!isLoading && !error && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>App Fee</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((app: any) => {
                const chip = appStatusChip(app.status);
                const paid = hasAppFeePaid(app.status);
                return (
                  <TableRow key={app.id} className={!paid ? "opacity-60" : undefined}>
                    <TableCell>
                      <p className="font-medium text-ink">{app.applicantName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{app.applicantEmail ?? ""}</p>
                    </TableCell>
                    <TableCell className="text-sm">{app.programName ?? "—"}</TableCell>
                    <TableCell className="text-sm">{app.intakeName ?? "—"}</TableCell>
                    <TableCell><StatusChip variant={chip.variant} label={chip.label} /></TableCell>
                    <TableCell>
                      <StatusChip
                        variant={paid ? "ok" : "pending"}
                        label={paid ? "Paid" : "Unpaid"}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.createdAt ? formatDateShort(app.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        title={!paid ? "Application fee not yet paid" : undefined}
                        className={!paid ? "cursor-not-allowed" : undefined}
                      >
                        <Button
                          asChild={paid}
                          size="sm"
                          variant="outline"
                          disabled={!paid}
                          className={!paid ? "pointer-events-none" : undefined}
                        >
                          {paid
                            ? <Link href={`/admin/applications/${app.id}`}>Review</Link>
                            : <span>Review</span>}
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
