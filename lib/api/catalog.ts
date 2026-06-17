import { apiGet } from "./client";
import type { Program, FeeType } from "@/lib/types";

export const catalogApi = {
  programs: () =>
    apiGet<Program[]>("/programs", { isAnonymous: true }),

  program: (id: string) =>
    apiGet<Program>(`/programs/${id}`, { isAnonymous: true }),

  intakes: () =>
    apiGet<import("@/lib/types").Intake[]>("/intakes", { isAnonymous: true }),

  intakesForProgram: (programId: string) =>
    apiGet<import("@/lib/types").Intake[]>(`/intakes?programId=${programId}`, { isAnonymous: true }),

  feeTypes: () =>
    apiGet<FeeType[]>("/admin/fee-types"),
};
