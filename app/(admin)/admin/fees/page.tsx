"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatKes } from "@/lib/format";
import { useState } from "react";
import type { FeeType } from "@/lib/types";
import { Pencil } from "lucide-react";

export default function AdminFeesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [newAmount, setNewAmount] = useState("");

  const { data: raw, isLoading, error } = useQuery({
    queryKey: ["admin-fee-types"],
    queryFn: () => adminApi.feeTypes(),
  });

  // Normalise API shape: plain array, or { items }, or { data }
  const fees: any[] = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateFeeType(editing!.id, { amountKes: Number(newAmount) }),
    onSuccess: () => {
      toast.success("Fee updated");
      qc.invalidateQueries({ queryKey: ["admin-fee-types"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.apiError ?? "Update failed"),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-semibold text-ink">Fee Configuration</h1>

      {isLoading && <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Banner variant="warning">Failed to load fee types.</Banner>}

      {!isLoading && !error && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Code</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee: any) => {
                const displayName = fee.label ?? fee.name ?? fee.code;
                const amount = fee.amountKes ?? fee.amount ?? 0;
                const isActive = fee.isActive ?? fee.active ?? false;
                const isTech = fee.code === "TECHNOLOGY_FEE" || fee.code === "Technology";
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-mono text-xs">{fee.code}</TableCell>
                    <TableCell>
                      <span className={isTech ? "text-gold-deep font-medium" : ""}>
                        {displayName}
                        {isTech && <span className="ml-1 text-xs text-gold-deep/60">(Technology Fee)</span>}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatKes(amount)}</TableCell>
                    <TableCell>
                      <span className={isActive ? "text-success text-sm font-medium" : "text-muted-foreground text-sm"}>
                        {isActive ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(fee); setNewAmount(String(amount)); }}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee: {editing?.label ?? editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Amount (KES)</Label>
            <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="gold" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
