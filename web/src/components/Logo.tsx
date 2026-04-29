import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="Pairs - Accueil">
      <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
        <rect width="40" height="40" rx="9" fill="currentColor" className="text-sage-700" />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="22"
          fontWeight="600"
          fill="#FBF8F3"
        >
          P
        </text>
      </svg>
      <span className="font-serif text-2xl tracking-tight text-ink">Pairs</span>
    </Link>
  );
}
