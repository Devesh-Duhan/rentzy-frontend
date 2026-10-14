export default function PropertySkeleton() {
  return (
    <div aria-hidden="true" className="h-full w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-[1.6] animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="p-4 sm:p-5">
        <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="flex h-12 flex-col justify-center gap-2"><div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></div>
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="my-4 flex h-10 items-center gap-3"><div className="h-4 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /><div className="h-4 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /><div className="h-4 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></div>
        <div className="flex min-h-16 items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800"><div className="h-6 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /><div className="h-11 w-11 animate-pulse rounded-full bg-indigo-50 dark:bg-indigo-950" /></div>
      </div>
    </div>
  );
}
