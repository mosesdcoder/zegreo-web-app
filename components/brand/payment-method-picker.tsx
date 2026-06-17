"use client";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  className?: string;
}

const METHODS: { value: PaymentMethod; label: string; description: string; icon: string }[] = [
  {
    value: "MPESA",
    label: "M-Pesa",
    description: "Pay via M-Pesa STK push to your phone",
    icon: "📱",
  },
  {
    value: "CARD",
    label: "Debit / Credit Card",
    description: "Visa, Mastercard accepted",
    icon: "💳",
  },
];

export function PaymentMethodPicker({ value, onChange, className }: PaymentMethodPickerProps) {
  return (
    <div className={cn("grid gap-3", className)}>
      {METHODS.map((method) => (
        <button
          key={method.value}
          type="button"
          onClick={() => onChange(method.value)}
          className={cn(
            "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
            value === method.value
              ? "border-gold bg-gold/5 ring-1 ring-gold"
              : "border-border bg-card hover:border-navy/30 hover:bg-canvas"
          )}
          aria-pressed={value === method.value}
        >
          <span className="text-2xl">{method.icon}</span>
          <div className="flex-1">
            <p className="font-semibold text-sm text-ink">{method.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
          </div>
          <div
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-colors",
              value === method.value
                ? "border-gold bg-gold"
                : "border-border bg-transparent"
            )}
          />
        </button>
      ))}
    </div>
  );
}
