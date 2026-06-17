import { cn } from "@/lib/utils";
import { formatKes } from "@/lib/format";

export interface FeeRow {
  label: string;
  amountKes: number;
  isTechnologyFee?: boolean;
  isSubtotal?: boolean;
  note?: string;
}

interface FeeTableProps {
  rows: FeeRow[];
  totalKes?: number;
  className?: string;
  title?: string;
}

export function FeeTable({ rows, totalKes, className, title }: FeeTableProps) {
  const computed = totalKes ?? rows.reduce((s, r) => s + r.amountKes, 0);

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      {title && (
        <div className="px-5 py-3 bg-canvas border-b">
          <h3 className="font-display font-semibold text-ink text-sm">{title}</h3>
        </div>
      )}
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={cn(
                "border-b last:border-0",
                row.isTechnologyFee && "bg-gold-soft/20",
                row.isSubtotal && "bg-canvas font-semibold"
              )}
            >
              <td className="px-5 py-3 text-left">
                <span
                  className={cn(
                    row.isTechnologyFee ? "text-gold-deep font-medium" : "text-foreground"
                  )}
                >
                  {row.label}
                </span>
                {row.isTechnologyFee && (
                  <span className="ml-2 text-xs text-gold-deep/70 font-normal">
                    (Technology Fee)
                  </span>
                )}
                {row.note && (
                  <p className="text-xs text-muted-foreground mt-0.5">{row.note}</p>
                )}
              </td>
              <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">
                {formatKes(row.amountKes)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-navy text-white">
            <td className="px-5 py-3 font-semibold text-sm">Total</td>
            <td className="px-5 py-3 text-right font-bold tabular-nums text-gold">
              {formatKes(computed)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
