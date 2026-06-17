import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-white text-2xl font-display font-semibold">
        Zogreo
      </Link>
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
        {children}
      </div>
    </div>
  );
}
