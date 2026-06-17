"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { applicationsApi } from "@/lib/api/applications";
import { useSession } from "@/lib/auth/useSession";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().min(1, "Required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationalId: z.string().min(6, "Valid ID required"),
  nationality: z.string().min(2),
  county: z.string().min(2),
  address: z.string().min(5),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

export function PersonalStep({ applicationId }: { applicationId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useSession();

  const { data: appList } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];
  const appId = applicationId ?? app?.id;

  // Parse saved personal JSON from the API response
  const savedPersonal = (() => {
    try { return app?.personalJson ? JSON.parse(app.personalJson) : null; } catch { return null; }
  })();

  // Derive first/last from session fullName — safe even if user hasn't loaded yet
  const fullName = (user as any)?.fullName ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const [sessionFirst, ...rest] = fullName.split(" ");
  const sessionLast = rest.join(" ");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    // Seed defaultValues with any saved data immediately — prevents blank form on back-nav
    defaultValues: {
      ...(savedPersonal ?? {}),
      firstName: sessionFirst || savedPersonal?.firstName || "",
      lastName: sessionLast || savedPersonal?.lastName || "",
      email: user?.email || savedPersonal?.email || "",
    },
  });

  // Re-sync when either app data OR user session loads (whichever is slower)
  useEffect(() => {
    if (!savedPersonal && !user) return;
    form.reset({
      ...(savedPersonal ?? {}),
      // Session fields always win for name + contact (they are read-only in the UI)
      firstName: sessionFirst || savedPersonal?.firstName || form.getValues("firstName"),
      lastName: sessionLast || savedPersonal?.lastName || form.getValues("lastName"),
      email: user?.email || savedPersonal?.email || form.getValues("email"),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.personalJson, user?.email]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => applicationsApi.patchPersonal(appId!, data),
    onSuccess: (updated: any) => {
      qc.setQueryData(["my-applications"], (old: any) =>
        Array.isArray(old) ? old.map((a: any) => a.id === updated.id ? updated : a) : old
      );
    },
    onError: (e: any) => toast.error(e.apiError ?? "Failed to save"),
  });

  const nextMutation = useMutation({
    mutationFn: (data: FormData) => applicationsApi.patchPersonal(appId!, data),
    onSuccess: (updated: any) => {
      qc.setQueryData(["my-applications"], (old: any) =>
        Array.isArray(old) ? old.map((a: any) => a.id === updated.id ? updated : a) : old
      );
      router.push("/apply/education");
    },
    onError: (e: any) => toast.error(e.apiError ?? "Failed to save"),
  });

  // Debounced autosave — avoids form onBlur which breaks Radix Select portals
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const watchedValues = form.watch();
  useEffect(() => {
    if (!appId || !form.formState.isDirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      form.handleSubmit((d) => saveMutation.mutate(d), () => {})();
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [JSON.stringify(watchedValues), appId]);

  if (!appId) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => nextMutation.mutate(d))}
        className="space-y-4"
      >
        {/* Name — pre-filled from signup, read-only */}
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-canvas cursor-default focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-canvas cursor-default focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
            <FormItem><FormLabel>Date of birth</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem><FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="nationalId" render={({ field }) => (
          <FormItem><FormLabel>National ID / Passport No.</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="nationality" render={({ field }) => (
            <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="Kenyan" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="county" render={({ field }) => (
            <FormItem><FormLabel>County</FormLabel><FormControl><Input placeholder="Nairobi" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem><FormLabel>Postal address</FormLabel><FormControl><Input placeholder="P.O. Box 1234, Nairobi" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
        )} />

        {/* Email & phone — pre-filled from signup, read-only */}
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} readOnly className="bg-canvas cursor-default focus-visible:ring-0" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Phone</label>
          <Input
            type="tel"
            value={user?.phone || ""}
            readOnly
            className="bg-canvas cursor-default focus-visible:ring-0 text-muted-foreground"
          />
        </div>


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
