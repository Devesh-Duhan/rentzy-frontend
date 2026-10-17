import ContentSkeleton from "@/components/ContentSkeleton";

export default function Loading() {
  return <ContentSkeleton label="Loading admin page" count={4} className="grid gap-6 sm:grid-cols-2" itemClassName="h-40" />;
}
