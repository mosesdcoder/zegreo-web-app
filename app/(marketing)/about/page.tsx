import type { Metadata } from "next";
import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Zogreo — our mission, values, and commitment to professional education in Kenya.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      <SectionHeading
        title="About Zogreo"
        subtitle="We exist to close the skills gap in East Africa by providing accessible, high-quality professional education."
      />

      <section className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-display font-semibold text-ink mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To raise skilled minds and build better futures by delivering accredited, industry-relevant programs that equip graduates for meaningful careers and entrepreneurship.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-ink mb-3">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To be East Africa's most trusted college for professional and vocational education — known for quality, integrity, and student outcomes.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-semibold text-ink mb-6">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { title: "Integrity", body: "We are transparent in everything — from fees to admissions decisions." },
            { title: "Excellence", body: "We hold our programs, faculty, and facilities to the highest standards." },
            { title: "Access", body: "Quality education should be available to every motivated learner, regardless of background." },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-xl bg-navy text-white p-6">
              <h3 className="font-display font-semibold text-gold mb-2">{title}</h3>
              <p className="text-sm text-gold-soft/80 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Button asChild variant="gold" size="lg">
          <Link href="/signup">Join Us</Link>
        </Button>
      </div>
    </div>
  );
}
