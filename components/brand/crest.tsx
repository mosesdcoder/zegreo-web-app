import { cn } from "@/lib/utils";

interface CrestProps {
  className?: string;
  size?: number;
}

export function Crest({ className, size = 48 }: CrestProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Zogreo crest"
    >
      {/* Shield shape */}
      <path
        d="M24 4L6 12V26C6 35.3 14.1 43.6 24 46C33.9 43.6 42 35.3 42 26V12L24 4Z"
        fill="currentColor"
        className="text-navy"
      />
      {/* Inner shield */}
      <path
        d="M24 8L10 15V26C10 33.5 16.4 40.3 24 42.5C31.6 40.3 38 33.5 38 26V15L24 8Z"
        fill="currentColor"
        className="text-navy-deep"
      />
      {/* Gold Z monogram */}
      <path
        d="M17 18H31L19 30H31"
        stroke="#C6A24A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  variant?: "light" | "dark";
}

export function Wordmark({ className, variant = "light" }: WordmarkProps) {
  const textColor = variant === "light" ? "text-white" : "text-ink";
  return (
    <span
      className={cn(
        "font-display font-semibold tracking-tight",
        textColor,
        className
      )}
    >
      Zogreo
    </span>
  );
}
