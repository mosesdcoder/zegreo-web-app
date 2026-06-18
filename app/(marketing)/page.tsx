import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/brand/section-heading";
import { FeeTable } from "@/components/brand/fee-table";
import { HeroSlideshow } from "@/components/brand/hero-slideshow";
import Link from "next/link";
import { CheckCircle, Clock, Award, Users } from "lucide-react";

const CAMPUS_SLIDES = [
  { src: "/campus/campus-1.jpeg", alt: "Zogreo campus building" },
  { src: "/campus/campus-2.jpeg", alt: "Zogreo campus front view" },
  { src: "/campus/campus-3.jpeg", alt: "Zogreo campus aerial view" },
  { src: "/campus/campus-5.png",  alt: "Zogreo campus grounds" },
  { src: "/campus/campus-6.jpeg", alt: "Zogreo campus exterior" },
  { src: "/campus/campus-7.jpeg", alt: "Zogreo campus tower view" },
];

export const metadata: Metadata = {
  title: "Zogreo Bible & Technical Training Institute | Raising Skilled Minds. Building Better Futures.",
  description: "Zogreo Bible & Technical Training Institute offers accredited certificate, diploma and advanced diploma programs in ICT, Business and Finance in Nairobi, Kenya. A faith-based institution equipping young people with practical skills and strong values.",
};

const PROGRAMS = [
  { slug: "ict-essentials", name: "ICT Essentials", level: "Certificate", duration: "6 months", description: "Foundational computing, networking, and digital skills." },
  { slug: "business-administration", name: "Business Administration", level: "Diploma", duration: "12 months", description: "Management, marketing, entrepreneurship and operations." },
  { slug: "accounting-finance", name: "Accounting & Finance", level: "Diploma", duration: "12 months", description: "Financial accounting, taxation, and business finance." },
  { slug: "computer-science", name: "Computer Science", level: "Advanced Diploma", duration: "18 months", description: "Software development, data structures, and systems design." },
  { slug: "digital-marketing", name: "Digital Marketing", level: "Certificate", duration: "6 months", description: "SEO, social media, content strategy, and analytics." },
  { slug: "project-management", name: "Project Management", level: "Diploma", duration: "12 months", description: "Planning, execution, risk management, and leadership." },
];

const WHY_US = [
  { icon: Award, title: "Accredited Programs", body: "Our programs are recognized and accredited by relevant Kenyan regulatory bodies." },
  { icon: Users, title: "Industry-Connected Faculty", body: "Learn from practitioners with real-world experience in their fields." },
  { icon: Clock, title: "Flexible Schedules", body: "Full-time, part-time, and weekend options to fit your life." },
  { icon: CheckCircle, title: "Career Support", body: "Job placement assistance, CV workshops, and employer partnerships." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSlideshow slides={CAMPUS_SLIDES} interval={5000} className="min-h-[520px] md:min-h-[680px] flex items-center">
        <section className="text-white px-6 py-20 md:py-36 w-full">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-block bg-gold/20 text-gold-soft text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
              Nairobi, Kenya
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-semibold leading-tight mb-3">
              Zogreo Bible &amp; Technical Training Institute
            </h1>
            <p className="text-gold text-lg md:text-xl font-semibold mb-6 tracking-wide">
              Raising Skilled Minds. Building Better Futures.
            </p>
            <p className="text-base md:text-lg text-gold-soft/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              A faith-based vocational and academic institution committed to equipping young people with practical skills, strong values, and the confidence to excel in their careers and communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" variant="gold">
                <Link href="/signup">Apply Now</Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/programs">Browse Programs</Link>
              </Button>
            </div>
          </div>
        </section>
      </HeroSlideshow>

      {/* Programs */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <SectionHeading
          title="Our Programs"
          subtitle="Choose from certificate to advanced diploma — all designed for real-world outcomes."
          align="center"
          className="mb-10"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROGRAMS.map((p) => (
            <Link
              key={p.slug}
              href={`/programs/${p.slug}`}
              className="rounded-xl border bg-card p-6 hover:shadow-md hover:border-gold/30 transition-all group"
            >
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">{p.level}</span>
              <h3 className="mt-2 text-lg font-display font-semibold text-ink group-hover:text-navy-deep leading-tight">{p.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">{p.duration}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/programs">View All Programs</Link>
          </Button>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-canvas px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <SectionHeading title="Why Zogreo?" align="center" className="mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_US.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 bg-card rounded-xl border p-5">
                <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-gold-deep" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees teaser */}
      <section className="px-6 py-16 max-w-3xl mx-auto w-full text-center">
        <SectionHeading
          title="Transparent Fees. No Surprises."
          subtitle="We show you every line — including the Technology Fee — before you apply."
          align="center"
          className="mb-8"
        />
        <FeeTable
          title="Example: Diploma in Business Administration"
          rows={[
            { label: "Application Fee", amountKes: 1000 },
            { label: "Registration Fee", amountKes: 5000 },
            { label: "Tuition Fee", amountKes: 45000 },
            { label: "Technology Fee", amountKes: 3000, isTechnologyFee: true },
            { label: "Examination Fee", amountKes: 4000 },
          ]}
          className="text-left mb-6"
        />
        <Button asChild variant="outline">
          <Link href="/fees">Full Fee Schedule</Link>
        </Button>
      </section>

      {/* CTA banner */}
      <section className="bg-navy text-white px-6 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-display font-semibold mb-4">Ready to start your journey?</h2>
          <p className="text-gold-soft/80 mb-8">Applications take less than 10 minutes. Your progress is saved automatically.</p>
          <Button asChild size="xl" variant="gold">
            <Link href="/signup">Apply Now — It's Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
