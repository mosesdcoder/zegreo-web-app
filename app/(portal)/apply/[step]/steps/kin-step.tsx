"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { applicationsApi } from "@/lib/api/applications";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(2),
  relationship: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export function KinStep({ applicationId }: { applicationId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: appList, isLoading: appLoading } = useQuery({ queryKey: ["my-applications"], queryFn: () => applicationsApi.list() });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];
  const appId = applicationId ?? app?.id;

  // Parse saved next-of-kin JSON from the API response
  const savedKin = (() => {
    try { return app?.nextOfKinJson ? JSON.parse(app.nextOfKinJson) : null; } catch { return null; }
  })();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: savedKin?.name ?? "",
      relationship: savedKin?.relationship ?? "",
      phone: savedKin?.phone ?? "",
      email: savedKin?.email ?? "",
    },
  });

  // Re-sync when saved data arrives (handles async cache load and back-navigation)
  useEffect(() => {
    if (savedKin) {
      form.reset(savedKin);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.nextOfKinJson]);

  const updateCache = (updated: any) => {
    qc.setQueryData(["my-applications"], (old: any) =>
      Array.isArray(old) ? old.map((a: any) => a.id === updated.id ? updated : a) : old
    );
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => applicationsApi.patchNextOfKin(appId!, data),
    onSuccess: updateCache,
    onError: (e: any) => toast.error(e.apiError ?? "Failed to save"),
  });

  const nextMutation = useMutation({
    mutationFn: (data: FormData) => applicationsApi.patchNextOfKin(appId!, data),
    onSuccess: (updated: any) => { updateCache(updated); router.push("/apply/documents"); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed to save"),
  });

  if (appLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => nextMutation.mutate(d))}
        onBlur={form.handleSubmit((d) => saveMutation.mutate(d), () => {})}
        className="space-y-4"
      >
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Full name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="relationship" render={({ field }) => (
          <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input placeholder="Parent / Spouse / Sibling" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email (optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Back</Button>
          <Button type="submit" variant="gold" className="flex-1" disabled={nextMutation.isPending}>
            {nextMutation.isPending ? "Saving…" : "Save & Continue →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
