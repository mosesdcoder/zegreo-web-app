import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FeeTable } from "@/components/brand/fee-table";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, CheckCircle, Calendar } from "lucide-react";

const PROGRAMS: Record<string, {
  name: string; level: string; mode: string; duration: string;
  description: string; tuition: number;
  curriculum: string[]; intakes: string[];
}> = {
  "ict-essentials": {
    name: "ICT Essentials",
    level: "Certificate",
    mode: "Full-time / Part-time",
    duration: "6 months",
    description: "A practical introduction to computing, networking, office applications, and digital literacy. Ideal for beginners entering the digital workforce.",
    tuition: 28000,
    curriculum: ["Computer Fundamentals & Operating Systems", "Office Productivity (Word, Excel, Presentations)", "Internet & Email Essentials", "Introduction to Networking", "Digital Safety & Security", "Practical IT Support"],
    intakes: ["January 2025", "May 2025", "September 2025"],
  },
  "business-administration": {
    name: "Business Administration",
    level: "Diploma",
    mode: "Full-time",
    duration: "12 months",
    description: "Comprehensive coverage of management principles, marketing, entrepreneurship, human resources, and business operations.",
    tuition: 45000,
    curriculum: ["Principles of Management", "Business Communication", "Marketing Fundamentals", "Human Resource Management", "Financial Management", "Entrepreneurship & Innovation", "Business Law", "Operations Management"],
    intakes: ["January 2025", "September 2025"],
  },
  "accounting-finance": {
    name: "Accounting & Finance",
    level: "Diploma",
    mode: "Full-time / Part-time",
    duration: "12 months",
    description: "Financial accounting, management accounting, taxation, business finance, and computer-assisted accounting.",
    tuition: 48000,
    curriculum: ["Financial Accounting I & II", "Management Accounting", "Taxation (Kenya)", "Business Finance", "Computer-Assisted Accounting (QuickBooks, Sage)", "Auditing Principles", "Economics for Business"],
    intakes: ["January 2025", "September 2025"],
  },
  "computer-science": {
    name: "Computer Science",
    level: "Advanced Diploma",
    mode: "Full-time",
    duration: "18 months",
    description: "Software development, algorithms, databases, networking, and system design — preparing you for technical roles.",
    tuition: 65000,
    curriculum: ["Programming Fundamentals (Python / Java)", "Data Structures & Algorithms", "Database Design & SQL", "Web Development (HTML, CSS, JavaScript)", "Networking & Security", "Mobile App Development", "Software Engineering Principles", "Cloud Computing Basics", "Final Project"],
    intakes: ["January 2025"],
  },
  "digital-marketing": {
    name: "Digital Marketing",
    level: "Certificate",
    mode: "Weekend",
    duration: "6 months",
    description: "SEO, social media management, content creation, paid advertising, and web analytics.",
    tuition: 30000,
    curriculum: ["Digital Marketing Strategy", "Search Engine Optimisation (SEO)", "Social Media Management", "Content Marketing & Copywriting", "Google Ads & Meta Ads", "Email Marketing", "Analytics & Reporting"],
    intakes: ["February 2025", "August 2025"],
  },
  "project-management": {
    name: "Project Management",
    level: "Diploma",
    mode: "Weekend",
    duration: "12 months",
    description: "Project planning, scheduling, risk management, stakeholder communication, and leadership.",
    tuition: 50000,
    curriculum: ["Introduction to Project Management", "Project Scope & Planning", "Cost & Schedule Management", "Risk Management", "Quality Management", "Stakeholder & Communications Management", "Agile & Scrum", "MS Project / Jira"],
    intakes: ["March 2025", "September 2025"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = PROGRAMS[slug];
  if (!p) return {};
  return {
    title: `${p.name} — ${p.level}`,
    description: p.description,
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROGRAMS[slug];
  if (!p) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-semibold text-gold uppercase tracking-widest">{p.level}</span>
        <h1 className="text-4xl font-display font-semibold text-ink mt-2 mb-4">{p.name}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">{p.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-canvas px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />{p.duration}
          </span>
          <span className="flex items-center gap-1.5 bg-canvas px-3 py-1.5 rounded-full">
            <MapPin className="h-4 w-4" />{p.mode}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          {/* Curriculum */}
          <section>
            <h2 className="text-xl font-display font-semibold text-ink mb-4">What you'll learn</h2>
            <ul className="space-y-2">
              {p.curriculum.map((module) => (
                <li key={module} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  {module}
                </li>
              ))}
            </ul>
          </section>

          {/* Intakes */}
          <section>
            <h2 className="text-xl font-display font-semibold text-ink mb-4">Upcoming Intakes</h2>
            <div className="space-y-2">
              {p.intakes.map((intake) => (
                <div key={intake} className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gold-deep" />
                  <span className="text-ink font-medium">{intake}</span>
                  <span className="ml-auto text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Open</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <FeeTable
            title="Fees"
            rows={[
              { label: "Application Fee", amountKes: 1000 },
              { label: "Registration Fee", amountKes: 5000 },
              { label: "Tuition Fee", amountKes: p.tuition },
              { label: "Technology Fee", amountKes: 3000, isTechnologyFee: true },
              { label: "Exam Fee", amountKes: 4000 },
            ]}
          />
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href="/signup">Apply Now</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/contact">Ask a question</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
