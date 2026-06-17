import type { Metadata } from "next";
import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programs",
  description: "Browse Zogreo's full catalog of accredited ICT, Business and Finance programs in Nairobi, Kenya.",
};

const PROGRAMS = [
  {
    slug: "ict-essentials",
    name: "ICT Essentials",
    level: "Certificate",
    mode: "Full-time / Part-time",
    duration: "6 months",
    description: "A practical introduction to computing, networking, office applications, and digital literacy. Ideal for beginners entering the digital workforce.",
    tuition: 28000,
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    level: "Certificate",
    mode: "Weekend",
    duration: "6 months",
    description: "Master SEO, social media management, content creation, paid advertising, and web analytics for today's digital landscape.",
    tuition: 30000,
  },
  {
    slug: "business-administration",
    name: "Business Administration",
    level: "Diploma",
    mode: "Full-time",
    duration: "12 months",
    description: "Comprehensive coverage of management principles, marketing, entrepreneurship, human resources, and business operations.",
    tuition: 45000,
  },
  {
    slug: "accounting-finance",
    name: "Accounting & Finance",
    level: "Diploma",
    mode: "Full-time / Part-time",
    duration: "12 months",
    description: "Financial accounting, management accounting, taxation, business finance, and computer-assisted accounting using popular software.",
    tuition: 48000,
  },
  {
    slug: "project-management",
    name: "Project Management",
    level: "Diploma",
    mode: "Weekend",
    duration: "12 months",
    description: "Project planning, scheduling, risk management, stakeholder communication, and leadership aligned with PMI principles.",
    tuition: 50000,
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    level: "Advanced Diploma",
    mode: "Full-time",
    duration: "18 months",
    description: "Deep dive into software development, algorithms, databases, networking, and system design — preparing you for technical roles.",
    tuition: 65000,
  },
];

const LEVEL_ORDER = ["Certificate", "Diploma", "Advanced Diploma"];

export default function ProgramsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeading
        title="Programs"
        subtitle="From foundational certificates to advanced diplomas — all taught by industry practitioners."
        className="mb-10"
      />

      {LEVEL_ORDER.map((level) => {
        const progs = PROGRAMS.filter((p) => p.level === level);
        if (!progs.length) return null;
        return (
          <section key={level} className="mb-12">
            <h2 className="text-xs font-semibold text-gold-deep uppercase tracking-widest mb-4">{level}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {progs.map((p) => (
                <div key={p.slug} className="rounded-xl border bg-card p-6 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink text-xl mb-1">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                      <span className="bg-canvas px-2 py-1 rounded">{p.mode}</span>
                      <span className="bg-canvas px-2 py-1 rounded">{p.duration}</span>
                      <span className="bg-gold/10 text-gold-deep px-2 py-1 rounded">
                        KES {p.tuition.toLocaleString()} / year
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/programs/${p.slug}`}>Learn more</Link>
                    </Button>
                    <Button asChild variant="gold" size="sm" className="flex-1">
                      <Link href="/signup">Apply Now</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
