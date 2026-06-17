"use client";

import { useParams, useRouter } from "next/navigation";
import { Stepper } from "@/components/brand/stepper";
import { ProgramStep } from "./steps/program-step";
import { PersonalStep } from "./steps/personal-step";
import { EducationStep } from "./steps/education-step";
import { KinStep } from "./steps/kin-step";
import { DocumentsStep } from "./steps/documents-step";
import { ReviewStep } from "./steps/review-step";

export const STEPS = [
  { key: "program", label: "Program" },
  { key: "personal", label: "Personal" },
  { key: "education", label: "Education" },
  { key: "kin", label: "Next of Kin" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

const STEP_COMPONENTS: Record<string, React.ComponentType<{ applicationId?: string }>> = {
  program: ProgramStep,
  personal: PersonalStep,
  education: EducationStep,
  kin: KinStep,
  documents: DocumentsStep,
  review: ReviewStep,
};

export default function ApplyStepPage() {
  const params = useParams<{ step: string }>();
  const step = params.step;
  const StepComponent = STEP_COMPONENTS[step] ?? ProgramStep;

  return (
    <div className="md:ml-56 min-h-screen bg-cream">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink mb-1">Apply</h1>
          <p className="text-sm text-muted-foreground">Complete each step — your progress is saved automatically.</p>
        </div>

        <Stepper steps={STEPS} currentStep={step} />

        <StepComponent />
      </div>
    </div>
  );
}
