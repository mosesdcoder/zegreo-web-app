"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { isAdminRole } from "@/lib/auth/session";

const schema = z.object({
  identifier: z.string().min(1, "Email or phone required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => authApi.login(data.identifier, data.password),
    onSuccess: async ({ token, fullName, role }) => {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName }),
      });
      toast.success(`Welcome back, ${fullName.split(" ")[0]}!`);
      if (isAdminRole(role)) {
        router.push("/admin/applications");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (e: any) => toast.error(e.apiError ?? "Login failed. Check your credentials."),
  });

  return (
    <>
      <h1 className="text-2xl font-display font-semibold text-ink mb-1">Sign In</h1>
      <p className="text-sm text-muted-foreground mb-6">
        New to Zogreo?{" "}
        <Link href="/signup" className="text-navy font-medium hover:underline">
          Create account
        </Link>
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or phone</FormLabel>
                <FormControl><Input placeholder="jane@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between w-full">
                  Password
                  <Link href="/forgot-password" className="text-xs text-navy hover:underline font-normal">
                    Forgot password?
                  </Link>
                </FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </Form>
    </>
  );
}
