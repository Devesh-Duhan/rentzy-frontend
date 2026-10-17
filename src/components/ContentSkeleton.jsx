export default function ContentSkeleton({ label = "Loading content", count = 3, className = "space-y-4", itemClassName = "h-24" }) {
  return (
    <div role="status" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className={`animate-pulse rounded-2xl border border-slate-200 bg-slate-100 motion-reduce:animate-none dark:border-slate-800 dark:bg-slate-900 ${itemClassName}`} />
      ))}
    </div>
  );
}
