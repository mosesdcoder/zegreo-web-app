"use client";

import { useSession, useLogout } from "@/lib/auth/useSession";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useSession();
  const logout = useLogout();

  const displayName = (user as any)?.fullName ?? user?.email ?? "Admin";
  const role = (user as any)?.role ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-display font-semibold text-ink">Profile</h1>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-navy-deep px-6 py-8 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-gold">{initials}</span>
          </div>
          <div>
            <p className="text-white font-display font-semibold text-xl">{displayName}</p>
            <p className="text-gold-soft/60 text-sm mt-0.5">{role}</p>
          </div>
        </div>

        <div className="px-6 py-4 divide-y divide-border">
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={user?.phone} />
          <Row label="Role" value={role} />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="font-semibold text-ink">Session</h2>
        <p className="text-sm text-muted-foreground">Logging out will end your current session and redirect you to the login page.</p>
        <Button variant="destructive" onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );
}
