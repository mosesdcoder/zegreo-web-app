import { cn } from "@/lib/utils";
import { Info, Gift, AlertTriangle } from "lucide-react";

type BannerVariant = "info" | "offer" | "warning";

interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BannerVariant, { wrapper: string; icon: React.ReactNode }> = {
  info: {
    wrapper: "bg-navy/5 border-navy/20 text-ink",
    icon: <Info className="h-4 w-4 text-navy shrink-0 mt-0.5" />,
  },
  offer: {
    wrapper: "bg-gold-soft border-gold/30 text-ink",
    icon: <Gift className="h-4 w-4 text-gold-deep shrink-0 mt-0.5" />,
  },
  warning: {
    wrapper: "bg-warn/10 border-warn/30 text-ink",
    icon: <AlertTriangle className="h-4 w-4 text-warn shrink-0 mt-0.5" />,
  },
};

export function Banner({ variant = "info", title, children, className }: BannerProps) {
  const { wrapper, icon } = STYLES[variant];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", wrapper, className)}>
      {icon}
      <div className="text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
