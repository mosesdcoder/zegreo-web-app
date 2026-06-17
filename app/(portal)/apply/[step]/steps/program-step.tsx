"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { catalogApi } from "@/lib/api/catalog";
import { applicationsApi } from "@/lib/api/applications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Banner } from "@/components/brand/banner";

export function ProgramStep() {
  const router = useRouter();
  const qc = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<string>();
  const [selectedIntake, setSelectedIntake] = useState<string>();

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["catalog-programs"],
    queryFn: () => catalogApi.programs(),
  });

  const { data: allIntakes, isLoading: intakesLoading } = useQuery({
    queryKey: ["catalog-intakes-all"],
    queryFn: () => catalogApi.intakes(),
  });

  const isIntakeOpen = (intake: any) => {
    const now = Date.now();
    return (
      intake.active !== false &&
      new Date(intake.opensAt ?? intake.OpensAt).getTime() <= now &&
      new Date(intake.closesAt ?? intake.ClosesAt).getTime() >= now
    );
  };

  const mutation = useMutation({
    mutationFn: () => applicationsApi.create(selectedProgram!, selectedIntake!),
    onSuccess: (app: any) => {
      qc.setQueryData(["application", app.id], app);
      toast.success("Application started!");
      router.push("/apply/personal");
    },
    onError: (e: any) => toast.error(e.apiError ?? "Could not create application"),
  });

  const selectedProgramData = (programs as any[])?.find((p) => p.id === selectedProgram);

  const programIntakes = (allIntakes as any[])?.filter(
    (i: any) => (i.programId ?? i.ProgramId) === selectedProgram && isIntakeOpen(i)
  ) ?? [];

  const hasNoIntakes = selectedProgram && !intakesLoading && programIntakes.length === 0;

  if (programsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Program dropdown */}
      <div className="space-y-2">
        <Label htmlFor="program-select">Program</Label>
        <Select
          value={selectedProgram}
          onValueChange={(val) => {
            setSelectedProgram(val);
            setSelectedIntake(undefined);
          }}
        >
          <SelectTrigger id="program-select" className="h-11">
            <SelectValue placeholder="Select a program…" />
          </SelectTrigger>
          <SelectContent>
            {(programs as any[])?.map((p) => {
              const hasOpen = (allIntakes as any[])?.some(
                (i: any) => (i.programId ?? i.ProgramId) === p.id && isIntakeOpen(i)
              );
              const unavailable = allIntakes !== undefined && !hasOpen;
              return (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  disabled={unavailable}
                  className={unavailable ? "opacity-40" : ""}
                >
                  <span className="flex items-center gap-2">
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      · {p.level} · {p.durationLabel}
                    </span>
                    {unavailable && (
                      <span className="text-xs text-muted-foreground">(no intakes)</span>
                    )}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Selected program detail chip */}
        {selectedProgramData && (
          <div className="rounded-lg bg-canvas border px-4 py-2.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="font-semibold text-gold-deep uppercase tracking-wide">
              {selectedProgramData.level}
            </span>
            <span>{selectedProgramData.mode}</span>
            <span>{selectedProgramData.durationLabel}</span>
          </div>
        )}
      </div>

      {/* Intake dropdown — only shown once program is selected */}
      {selectedProgram && !hasNoIntakes && (
        <div className="space-y-2">
          <Label htmlFor="intake-select">Intake</Label>
          {intakesLoading ? (
            <Skeleton className="h-11 w-full rounded-md" />
          ) : (
            <Select value={selectedIntake} onValueChange={setSelectedIntake}>
              <SelectTrigger id="intake-select" className="h-11">
                <SelectValue placeholder="Select an intake…" />
              </SelectTrigger>
              <SelectContent>
                {programIntakes.map((intake: any) => (
                  <SelectItem key={intake.id} value={intake.id}>
                    <span className="flex items-center gap-2">
                      <span>{intake.name ?? intake.label}</span>
                      {intake.startsAt && (
                        <span className="text-xs text-muted-foreground">
                          · Starts{" "}
                          {new Date(intake.startsAt ?? intake.StartsAt).toLocaleDateString("en-KE", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {hasNoIntakes && (
        <Banner variant="warning">
          No open intakes for this program right now. Please select a different program or check back later.
        </Banner>
      )}

      <Button
        variant="gold"
        size="lg"
        className="w-full"
        disabled={!selectedProgram || !selectedIntake || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Saving…" : "Continue →"}
      </Button>
    </div>
  );
}
