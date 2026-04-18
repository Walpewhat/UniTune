import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
