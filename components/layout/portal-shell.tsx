"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/apply/program", icon: FileText, label: "Application" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-navy text-white h-14 flex items-center justify-between px-4 shadow-md">
        <Link href="/dashboard" className="font-display font-semibold text-lg">
          Zogreo
        </Link>
        <span className="text-gold-soft text-sm">Portal</span>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom tab nav (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-navy border-t border-navy-deep md:hidden">
        <div className="grid grid-cols-4">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href) || (href === "/apply/program" && pathname.startsWith("/apply"));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
                  isActive ? "text-gold" : "text-gold-soft/60 hover:text-gold-soft"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar for portal (simple) */}
      <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-56 bg-navy flex-col pt-6 gap-1 px-3 z-20">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href) || (href === "/apply/program" && pathname.startsWith("/apply"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-gold/20 text-gold font-semibold"
                  : "text-gold-soft/70 hover:bg-navy-deep hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </aside>
    </div>
  );
}
