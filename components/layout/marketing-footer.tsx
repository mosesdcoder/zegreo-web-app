import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-navy-deep text-gold-soft/70 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-display font-semibold text-white text-base mb-3">Zogreo</p>
          <p className="text-xs leading-relaxed">Raising Skilled Minds.<br />Building Better Futures.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Programs</p>
          <ul className="space-y-2">
            <li><Link href="/programs" className="hover:text-white transition-colors">All Programs</Link></li>
            <li><Link href="/fees" className="hover:text-white transition-colors">Fees</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Institution</p>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Legal</p>
          <ul className="space-y-2">
            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link></li>
            <li><Link href="/legal/refunds" className="hover:text-white transition-colors">Refunds</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy/50 px-4 py-4 text-center text-xs">
        © {new Date().getFullYear()} Zogreo. All rights reserved.
      </div>
    </footer>
  );
}
