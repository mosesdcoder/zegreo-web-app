"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";

const schema = z
  .object({
    password: z.string().min(8, "Min. 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const form = useForm<{ password: string; confirm: string }>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const mutation = useMutation({
    mutationFn: (data: { password: string }) => authApi.resetPassword(token, data.password),
    onSuccess: () => {
      toast.success("Password reset! Please sign in.");
      router.push("/login");
    },
    onError: (e: any) => toast.error(e.apiError ?? "Reset failed. Link may be expired."),
  });

  return (
    <>
      <h1 className="text-2xl font-display font-semibold text-ink mb-1">Reset Password</h1>
      <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl><Input type="password" placeholder="Min. 8 characters" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="confirm" render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl><Input type="password" placeholder="Repeat password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Resetting…" : "Reset Password"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
