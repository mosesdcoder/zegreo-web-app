"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileStack,
  CreditCard,
  GraduationCap,
  Settings,
  ScrollText,
  UserCog,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, useLogout } from "@/lib/auth/useSession";
import { useState, useRef, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/admin/applications", icon: FileStack, label: "Applications" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/students", icon: GraduationCap, label: "Students" },
  { href: "/admin/fees", icon: Settings, label: "Fee Config" },
  { href: "/admin/audit", icon: ScrollText, label: "Audit Log" },
  { href: "/admin/staff", icon: UserCog, label: "Staff" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = (user as any)?.fullName ?? user?.email ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-navy-deep flex flex-col z-30">
        <div className="h-16 flex items-center px-5 border-b border-navy/50">
          <Link href="/admin/applications" className="font-display font-semibold text-white text-lg">
            Zogreo Admin
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-gold/20 text-gold font-semibold"
                    : "text-gold-soft/60 hover:bg-navy hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Profile footer */}
        <div className="px-3 py-4 border-t border-navy/50" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy transition-colors text-left"
          >
            <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-gold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-gold-soft/50 truncate">{(user as any)?.role ?? "Admin"}</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-gold-soft/50 transition-transform shrink-0", menuOpen && "rotate-180")} />
          </button>

          {menuOpen && (
            <div className="mt-1 rounded-lg bg-navy overflow-hidden border border-navy/80">
              <Link
                href="/admin/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-soft/80 hover:bg-navy-deep hover:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger/80 hover:bg-navy-deep hover:text-danger transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm h-16 flex items-center px-6 border-b border-border shadow-sm justify-between">
          <div />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-gold-deep">{initials}</span>
            </div>
            <span className="text-sm text-muted-foreground">{displayName}</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
