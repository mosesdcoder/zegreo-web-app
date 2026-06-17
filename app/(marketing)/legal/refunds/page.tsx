import type { Metadata } from "next";
export const metadata: Metadata = { title: "Refund Policy" };
export default function RefundsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose prose-sm prose-headings:font-display prose-headings:text-ink">
      <h1>Refund Policy</h1>
      <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
      <h2>Application Fee</h2>
      <p>The KES 1,000 application fee is non-refundable under all circumstances.</p>
      <h2>Tuition Fee</h2>
      <ul>
        <li><strong>Before program commencement:</strong> Full refund of tuition paid, less a KES 2,000 administrative fee.</li>
        <li><strong>Within the first two weeks of class:</strong> 75% refund of tuition paid.</li>
        <li><strong>Weeks 3–4:</strong> 50% refund.</li>
        <li><strong>After week 4:</strong> No refund.</li>
      </ul>
      <h2>Technology Fee</h2>
      <p>The Technology Fee is non-refundable once the term has commenced.</p>
      <h2>How to request a refund</h2>
      <p>Email bursar@zogreo.ac.ke with your application reference number and reason for withdrawal. Refunds are processed within 14 business days to the original payment method.</p>
    </div>
  );
}
