import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service" };
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose prose-sm prose-headings:font-display prose-headings:text-ink">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
      <p>By using Zogreo's online portal and applying to our programs, you agree to these terms.</p>
      <h2>Application</h2>
      <p>Submitting an application does not guarantee admission. All applications are subject to review and available places.</p>
      <h2>Fees</h2>
      <p>Application fees are non-refundable. Tuition fees are subject to the Refund Policy. Zogreo reserves the right to adjust fees for future intakes with reasonable notice.</p>
      <h2>Conduct</h2>
      <p>Students must comply with Zogreo's code of conduct. Misconduct may result in suspension or expulsion without fee refund.</p>
      <h2>Intellectual Property</h2>
      <p>All course materials are the intellectual property of Zogreo College and may not be reproduced without permission.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use of our services constitutes acceptance of any changes.</p>
      <h2>Contact</h2>
      <p>legal@zogreo.ac.ke</p>
    </div>
  );
}
