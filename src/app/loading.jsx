import ContentSkeleton from "@/components/ContentSkeleton";

export default function Loading() {
  return (
    <div className="app-container space-y-6 pb-12 pt-28">
      <div aria-hidden="true" className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none dark:bg-slate-800" />
      <ContentSkeleton label="Loading page" count={6} className="grid grid-cols-2 gap-4 lg:grid-cols-3" itemClassName="h-64" />
    </div>
  );
}
