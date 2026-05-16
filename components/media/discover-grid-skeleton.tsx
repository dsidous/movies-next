import { Skeleton } from '@/components/ui/skeleton';

export function DiscoverGridSkeleton() {
  return (
    <div
      className="grid w-full grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-3 sm:gap-4"
      aria-busy="true"
      aria-label="Loading results"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-0">
          <Skeleton className="aspect-2/3 w-full rounded-2xl" />
          <Skeleton className="mt-3 h-5 w-4/5" />
          <Skeleton className="mt-2 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
