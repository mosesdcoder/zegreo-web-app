import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  key: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Application steps" className={cn("w-full", className)}>
      {/* Mobile: compact pill row */}
      <ol className="flex items-center gap-1 overflow-x-auto pb-1 md:hidden">
        {steps.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={step.key} className="flex items-center gap-1 shrink-0">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-colors",
                  done && "bg-success border-success text-white",
                  active && "bg-gold border-gold text-white shadow-sm",
                  !done && !active && "border-border text-muted-foreground bg-card"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              {idx < steps.length - 1 && (
                <div className={cn("h-0.5 w-4", done ? "bg-success" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Desktop: labeled chips */}
      <ol className="hidden md:flex items-center gap-0">
        {steps.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors",
                    done && "bg-success border-success text-white",
                    active && "bg-gold border-gold text-white shadow-sm shadow-gold/30",
                    !done && !active && "border-border text-muted-foreground bg-card"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : idx + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium text-center leading-tight max-w-[80px]",
                    active && "text-gold-deep font-semibold",
                    done && "text-success",
                    !done && !active && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 mb-6 transition-colors",
                    done ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
