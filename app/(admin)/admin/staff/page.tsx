"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { formatDateShort } from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";
import type { UserRole } from "@/lib/types";

export default function AdminStaffPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "REGISTRAR" as UserRole, isActive: true });

  const { data: raw, isLoading, error } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: () => adminApi.staff(),
  });

  const staff: any[] = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);

  const addMutation = useMutation({
    mutationFn: () => adminApi.createStaff(form),
    onSuccess: () => {
      toast.success("Staff member added");
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
      setShowAdd(false);
      setForm({ name: "", email: "", role: "REGISTRAR", isActive: true });
    },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteStaff(id),
    onSuccess: () => {
      toast.success("Staff removed");
      qc.invalidateQueries({ queryKey: ["admin-staff"] });
    },
    onError: (e: any) => toast.error(e.apiError ?? "Failed"),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-ink">Staff & Roles</h1>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Staff
        </Button>
      </div>

      {isLoading && <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Banner variant="warning">Failed to load staff.</Banner>}

      {!isLoading && !error && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Since</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No staff members.</TableCell>
                </TableRow>
              )}
              {staff.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-ink">{s.fullName ?? s.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-gold-deep uppercase tracking-wide">
                      {s.role.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={(s.isActive ?? s.active) ? "text-success text-sm font-medium" : "text-muted-foreground text-sm"}>
                      {(s.isActive ?? s.active) ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateShort(s.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGISTRAR">Registrar</SelectItem>
                  <SelectItem value="BURSAR">Bursar</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="gold" onClick={() => addMutation.mutate()} disabled={!form.name || !form.email || addMutation.isPending}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
