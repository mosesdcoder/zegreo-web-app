import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-sm border-b border-navy-deep">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display font-semibold text-lg text-white">Zogreo</span>
          <span className="text-[10px] text-gold-soft/70 tracking-wide hidden sm:block">
            Bible &amp; Technical Training Institute
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gold-soft">
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <Link href="/fees" className="hover:text-white transition-colors">Fees</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-gold-soft hover:text-white hover:bg-navy-deep">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" variant="gold">
            <Link href="/signup">Apply Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
