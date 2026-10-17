import ContentSkeleton from "@/components/ContentSkeleton";

export default function Loading() {
  return <ContentSkeleton label="Loading dashboard" count={6} className="grid grid-cols-2 gap-4 lg:grid-cols-3" itemClassName="h-40" />;
}
