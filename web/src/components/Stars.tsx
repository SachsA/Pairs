export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i < full ? "#849572" : "none"}
          stroke="#849572"
          strokeWidth="1.4"
        >
          <path d="M10 1.5l2.6 5.3 5.9.86-4.27 4.16 1.01 5.87L10 14.9l-5.27 2.78 1.01-5.87L1.5 7.66l5.9-.86L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
