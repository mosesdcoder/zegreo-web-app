"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";

const schema = z.object({ email: z.string().email("Valid email required") });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<{ email: string }>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data.email),
    onSuccess: () => setSent(true),
    onError: (e: any) => toast.error(e.apiError ?? "Request failed"),
  });

  if (sent) {
    return (
      <>
        <h1 className="text-2xl font-display font-semibold text-ink mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          If an account exists for that address, a reset link has been sent.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-display font-semibold text-ink mb-1">Forgot Password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email and we'll send a reset link.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-navy hover:underline">Back to Sign In</Link>
      </div>
    </>
  );
}
