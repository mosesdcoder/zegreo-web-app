import type { Metadata } from "next";
import { FeeTable } from "@/components/brand/fee-table";
import { SectionHeading } from "@/components/brand/section-heading";
import { Banner } from "@/components/brand/banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fees",
  description: "Complete, transparent fee schedule for all Zogreo programs including the Technology Fee breakdown.",
};

const FEE_SCHEDULES = [
  {
    level: "Certificate Programs",
    programs: ["ICT Essentials", "Digital Marketing"],
    fees: [
      { label: "Application Fee (once-off)", amountKes: 1000 },
      { label: "Registration Fee", amountKes: 5000 },
      { label: "Tuition Fee (per year)", amountKes: 28000 },
      { label: "Technology Fee", amountKes: 3000, isTechnologyFee: true },
      { label: "Examination Fee", amountKes: 3000 },
    ],
  },
  {
    level: "Diploma Programs",
    programs: ["Business Administration", "Accounting & Finance", "Project Management"],
    fees: [
      { label: "Application Fee (once-off)", amountKes: 1000 },
      { label: "Registration Fee", amountKes: 5000 },
      { label: "Tuition Fee (per year)", amountKes: 45000 },
      { label: "Technology Fee", amountKes: 3000, isTechnologyFee: true },
      { label: "Examination Fee", amountKes: 4000 },
    ],
  },
  {
    level: "Advanced Diploma Programs",
    programs: ["Computer Science"],
    fees: [
      { label: "Application Fee (once-off)", amountKes: 1000 },
      { label: "Registration Fee", amountKes: 5000 },
      { label: "Tuition Fee (per year)", amountKes: 65000 },
      { label: "Technology Fee", amountKes: 3000, isTechnologyFee: true },
      { label: "Examination Fee", amountKes: 5000 },
    ],
  },
];

export default function FeesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <SectionHeading
        title="Fee Schedule"
        subtitle="All fees in Kenyan Shillings (KES). The Technology Fee is charged to support digital learning infrastructure."
      />

      <Banner variant="info" title="Technology Fee">
        The Technology Fee of KES 3,000 per year covers access to our e-learning platform, digital library, online assessments, and IT infrastructure. It is shown separately on every invoice for full transparency.
      </Banner>

      {FEE_SCHEDULES.map((schedule) => (
        <section key={schedule.level} className="space-y-3">
          <div>
            <h2 className="text-lg font-display font-semibold text-ink">{schedule.level}</h2>
            <p className="text-sm text-muted-foreground">{schedule.programs.join(" · ")}</p>
          </div>
          <FeeTable rows={schedule.fees} />
        </section>
      ))}

      <div className="rounded-xl border bg-canvas p-5 space-y-3">
        <h3 className="font-display font-semibold text-ink">Payment Plans</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Fees can be paid in full or in instalments (50% at registration, 50% at mid-term). M-Pesa and card payments accepted. Contact the bursar's office to discuss a payment plan.
        </p>
      </div>

      <div className="text-center pt-4">
        <Button asChild variant="gold" size="lg">
          <Link href="/signup">Apply Now</Link>
        </Button>
      </div>
    </div>
  );
}
