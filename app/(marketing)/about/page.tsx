import type { Metadata } from "next";
import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zogreo Bible & Technical Training Institute is a faith-based vocational and academic institution committed to equipping young people with practical skills, strong values, and the confidence to excel in their careers and communities.",
};

const VALUES = [
  {
    title: "Integrity",
    body: "We are transparent in everything — from fees to admissions decisions.",
  },
  {
    title: "Excellence",
    body: "We hold our programs, faculty, and facilities to the highest standards.",
  },
  {
    title: "Faith",
    body: "Rooted in Christian values, we nurture character alongside competence.",
  },
  {
    title: "Access",
    body: "Quality education should be available to every motivated learner, regardless of background.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      <SectionHeading
        title="About Zogreo Bible & Technical Training Institute"
        subtitle="A faith-based institution committed to equipping young people with practical skills, strong values, and the confidence to excel."
      />

      {/* Who we are */}
      <section className="prose prose-neutral max-w-none">
        <p className="text-muted-foreground leading-relaxed text-base">
          <strong className="text-ink">Zogreo Bible &amp; Technical Training Institute</strong> is a
          faith-based vocational and academic institution committed to equipping young people with
          practical skills, strong values, and the confidence to excel in their careers and
          communities. We believe that holistic education — one that develops the mind, the hand,
          and the character — is the surest path to a life of purpose and impact.
        </p>
        <p className="text-muted-foreground leading-relaxed text-base mt-4">
          Located in Nairobi, Kenya, Zogreo offers accredited certificate, diploma, and advanced
          diploma programs in ICT, Business, Accounting &amp; Finance, and more. Our programs are
          designed to meet the real-world demands of East Africa's growing economy, delivered by
          faculty who combine academic rigour with industry experience.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-display font-semibold text-ink mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To raise skilled minds and build better futures by delivering accredited,
            industry-relevant programs that equip graduates for meaningful careers,
            entrepreneurship, and service — grounded in Christian values.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-display font-semibold text-ink mb-3">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To be East Africa's most trusted faith-based college for professional and vocational
            education — known for quality, integrity, and graduates who lead with both skill
            and character.
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-display font-semibold text-ink mb-6">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map(({ title, body }) => (
            <div key={title} className="rounded-xl bg-navy text-white p-6">
              <h3 className="font-display font-semibold text-gold mb-2">{title}</h3>
              <p className="text-sm text-gold-soft/80 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center space-y-3">
        <p className="text-muted-foreground">
          Ready to be part of something bigger than a qualification?
        </p>
        <Button asChild variant="gold" size="lg">
          <Link href="/signup">Apply Now</Link>
        </Button>
      </div>
    </div>
  );
}
