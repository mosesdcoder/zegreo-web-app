"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { useState } from "react";

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit", page],
    queryFn: () => adminApi.auditLog({ page: String(page), perPage: "30" }),
  });

  const items: any[] = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-semibold text-ink">Audit Log</h1>

      {isLoading && <div className="space-y-2">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Banner variant="warning">Failed to load audit log.</Banner>}

      {!isLoading && !error && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No audit entries.</TableCell>
                </TableRow>
              )}
              {items.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {(() => { const d = entry.at ?? entry.createdAt ?? entry.timestamp; return d ? formatDateTime(d) : "—"; })()}
                  </TableCell>
                  <TableCell className="text-sm">{entry.staffName ?? entry.actorName ?? entry.actor ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs bg-canvas/50 px-2 py-1 rounded">{entry.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{entry.entityType ?? entry.entity} #{(entry.entityId ?? entry.entity_id ?? "").slice(0, 8)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.total > 30 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.total / 30)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 30)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
