"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applicationsApi } from "@/lib/api/applications";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const rowSchema = z.object({
  institution: z.string().min(2),
  qualification: z.string().min(2),
  yearCompleted: z.number().int().min(1990).max(new Date().getFullYear()),
  grade: z.string().optional(),
});

const schema = z.object({ history: z.array(rowSchema).min(1, "Add at least one entry") });
type FormData = z.infer<typeof schema>;

export function EducationStep({ applicationId }: { applicationId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: appList, isLoading: appLoading } = useQuery({ queryKey: ["my-applications"], queryFn: () => applicationsApi.list() });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];
  const appId = applicationId ?? app?.id;

  // Parse saved education JSON from the API response
  const savedEducation: any[] = (() => {
    try { return app?.educationHistoryJson ? JSON.parse(app.educationHistoryJson) : []; } catch { return []; }
  })();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { history: savedEducation.length ? savedEducation : [{ institution: "", qualification: "", yearCompleted: 2020, grade: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "history" });

  // Re-sync when saved data arrives (handles async cache load and back-navigation)
  useEffect(() => {
    if (savedEducation.length) {
      form.reset({ history: savedEducation });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.educationHistoryJson]);

  const updateCache = (updated: any) => {
    qc.setQueryData(["my-applications"], (old: any) =>
      Array.isArray(old) ? old.map((a: any) => a.id === updated.id ? updated : a) : old
    );
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => applicationsApi.patchEducation(appId!, data),
    onSuccess: updateCache,
    onError: (e: any) => toast.error(e.apiError ?? "Failed to save"),
  });

  const nextMutation = useMutation({
    mutationFn: (data: FormData) => applicationsApi.patchEducation(appId!, data),
    onSuccess: (updated: any) => { updateCache(updated); router.push("/apply/kin"); },
    onError: (e: any) => toast.error(e.apiError ?? "Failed to save"),
  });

  if (appLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => nextMutation.mutate(d))}
        onBlur={form.handleSubmit((d) => saveMutation.mutate(d), () => {})}
        className="space-y-5"
      >
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Entry {idx + 1}</span>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                )}
              </div>

              <FormField control={form.control} name={`history.${idx}.institution`} render={({ field }) => (
                <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="Nairobi High School" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`history.${idx}.qualification`} render={({ field }) => (
                <FormItem><FormLabel>Qualification</FormLabel><FormControl><Input placeholder="KCSE" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name={`history.${idx}.yearCompleted`} render={({ field }) => (
                  <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name={`history.${idx}.grade`} render={({ field }) => (
                  <FormItem><FormLabel>Grade (optional)</FormLabel><FormControl><Input placeholder="B+" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => append({ institution: "", qualification: "", yearCompleted: 2020, grade: "" })}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Another Entry
        </Button>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Back</Button>
          <Button type="submit" variant="gold" className="flex-1" disabled={nextMutation.isPending}>
            {nextMutation.isPending ? "Saving…" : "Save & Continue →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
