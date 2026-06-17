import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", description: "Zogreo Privacy Policy — how we collect, use and protect your personal data." };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 prose prose-sm prose-headings:font-display prose-headings:text-ink">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
      <p>Zogreo College ("we", "our", "us") is committed to protecting your personal data. This policy explains what we collect, why we collect it, and your rights.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Identity data: name, date of birth, national ID number</li>
        <li>Contact data: email address, phone number, postal address</li>
        <li>Educational records: qualifications, certificates uploaded during application</li>
        <li>Financial data: payment references (we do not store card numbers)</li>
        <li>Usage data: log files, browser type, pages visited</li>
      </ul>
      <h2>How we use it</h2>
      <p>We use your data to process your application, communicate with you, comply with legal obligations, and improve our services. We do not sell your data to third parties.</p>
      <h2>Data retention</h2>
      <p>Application data is retained for 7 years after your last interaction with us, or as required by Kenyan law.</p>
      <h2>Your rights</h2>
      <p>You have the right to access, correct, or delete your data. Contact us at privacy@zogreo.ac.ke.</p>
      <h2>Contact</h2>
      <p>Data Controller: Zogreo College, Nairobi, Kenya. Email: privacy@zogreo.ac.ke</p>
    </div>
  );
}
