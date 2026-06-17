"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateShort } from "@/lib/format";
import { useState } from "react";
import Link from "next/link";

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params: Record<string, string> = { page: String(page), perPage: "20" };
  if (search) params.search = search;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-students", params],
    queryFn: () => adminApi.students(params),
  });

  const items: any[] = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-semibold text-ink">Students</h1>
        <span className="text-sm text-muted-foreground">{data?.total ?? 0} enrolled</span>
      </div>

      <Input
        placeholder="Search by name or admission number…"
        className="max-w-xs"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {isLoading && <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Banner variant="warning">Failed to load students.</Banner>}

      {!isLoading && !error && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No enrolled students.</TableCell>
                </TableRow>
              )}
              {items.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm font-semibold">{s.admissionNumber ?? "—"}</TableCell>
                  <TableCell>
                    <p className="font-medium text-ink">{(s.studentName ?? `${s.personal?.firstName ?? ""} ${s.personal?.lastName ?? ""}`.trim()) || "—"}</p>
                    <p className="text-xs text-muted-foreground">{s.studentEmail ?? s.personal?.email ?? ""}</p>
                  </TableCell>
                  <TableCell className="text-sm">{s.programName ?? s.program?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.intakeName ?? s.intake?.label ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.enrolledAt ? formatDateShort(s.enrolledAt) : s.decidedAt ? formatDateShort(s.decidedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/applications/${s.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
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
