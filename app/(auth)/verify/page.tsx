"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";

const schema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";
  const [resendCountdown, setResendCountdown] = useState(60);
  const [devOtp, setDevOtp] = useState<string>();

  const form = useForm<{ otp: string }>({ resolver: zodResolver(schema), defaultValues: { otp: "" } });

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const verifyMutation = useMutation({
    mutationFn: ({ otp }: { otp: string }) => authApi.verifyOtp(phone, otp),
    onSuccess: async ({ token }) => {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      toast.success("Phone verified! Welcome.");
      router.push("/dashboard");
    },
    onError: (e: any) => toast.error(e.apiError ?? "Verification failed"),
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.sendOtp(phone),
    onSuccess: (res: any) => {
      toast.success("OTP resent.");
      setResendCountdown(60);
      if (res?.devOtp) setDevOtp(res.devOtp);
    },
    onError: (e: any) => toast.error(e.apiError ?? "Failed to resend"),
  });

  return (
    <>
      <h1 className="text-2xl font-display font-semibold text-ink mb-1">Verify Phone</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter the 6-digit code sent to <span className="font-medium text-ink">{phone || "your phone"}</span>.
      </p>

      {devOtp && (
        <div className="mb-4 rounded-lg bg-gold-soft/60 border border-gold/30 px-3 py-2 text-sm">
          <span className="font-semibold text-gold-deep">Dev OTP: </span>
          <code className="font-mono">{devOtp}</code>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => verifyMutation.mutate(d))} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-time code</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="text-center text-xl tracking-widest font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? "Verifying…" : "Verify"}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center">
        {resendCountdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend in <span className="font-semibold text-ink">{resendCountdown}s</span>
          </p>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            Resend OTP
          </Button>
        )}
      </div>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
      <VerifyForm />
    </Suspense>
  );
}
