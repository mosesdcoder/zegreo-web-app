import { StatusLadder } from "@/components/brand/status-ladder";
import { Stepper } from "@/components/brand/stepper";
import { FeeTable } from "@/components/brand/fee-table";
import { DevDocRows } from "./dev-client";
import { PaymentMethodPicker } from "@/components/brand/payment-method-picker";
import { Banner } from "@/components/brand/banner";
import { SectionHeading } from "@/components/brand/section-heading";
import { StatusChip } from "@/components/brand/status-chip";
import { Crest, Wordmark } from "@/components/brand/crest";
import { DevPaymentPicker } from "./dev-client";

export default function DevPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
      <SectionHeading title="Brand Component Harness" subtitle="Visual test for all shared components." />

      {/* Crest + Wordmark */}
      <section className="space-y-4">
        <h3 className="font-semibold text-ink">Crest + Wordmark</h3>
        <div className="flex items-center gap-4 p-4 bg-navy rounded-xl">
          <Crest size={48} />
          <Wordmark className="text-2xl" variant="light" />
        </div>
        <div className="flex items-center gap-4 p-4 bg-cream rounded-xl border">
          <Crest size={40} />
          <Wordmark className="text-xl" variant="dark" />
        </div>
      </section>

      {/* Status chips */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Status Chips</h3>
        <div className="flex flex-wrap gap-2">
          <StatusChip variant="ok" label="Verified" />
          <StatusChip variant="pending" label="Pending" />
          <StatusChip variant="bad" label="Rejected" />
          <StatusChip variant="todo" label="Not Started" />
          <StatusChip variant="info" label="Under Review" />
        </div>
      </section>

      {/* Status Ladder */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Status Ladder</h3>
        <StatusLadder
          currentStatus="DOCUMENTS_REQUIRED"
          statusHistory={[
            { status: "DRAFT", timestamp: "2024-01-10T10:00:00Z" },
            { status: "SUBMITTED", timestamp: "2024-01-12T14:30:00Z" },
            { status: "UNDER_REVIEW", timestamp: "2024-01-15T09:00:00Z" },
          ]}
        />
      </section>

      {/* Stepper */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Stepper</h3>
        <Stepper
          steps={[
            { key: "program", label: "Program" },
            { key: "personal", label: "Personal" },
            { key: "education", label: "Education" },
            { key: "kin", label: "Next of Kin" },
            { key: "review", label: "Review" },
          ]}
          currentStep="education"
        />
      </section>

      {/* Fee Table */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Fee Table</h3>
        <FeeTable
          title="Diploma in Business Administration"
          rows={[
            { label: "Application Fee", amountKes: 1000 },
            { label: "Registration Fee", amountKes: 5000 },
            { label: "Tuition Fee", amountKes: 45000 },
            { label: "Technology Fee", amountKes: 3000, isTechnologyFee: true },
            { label: "Examination Fee", amountKes: 4000 },
          ]}
        />
      </section>

      {/* Doc Rows */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Doc Rows</h3>
        <DevDocRows />
      </section>

      {/* Payment Method Picker */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Payment Method Picker</h3>
        <DevPaymentPicker />
      </section>

      {/* Banners */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink">Banners</h3>
        <Banner variant="info" title="Did you know?">
          You can save your application progress and return later.
        </Banner>
        <Banner variant="offer" title="Congratulations! You have an offer">
          Review your offer details and accept before the deadline to secure your place.
        </Banner>
        <Banner variant="warning" title="Action Required">
          Upload your missing documents within 7 days or your application may be cancelled.
        </Banner>
      </section>
    </div>
  );
}
