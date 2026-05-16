import { Skeleton } from '@/components/ui/skeleton';

function RowSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="w-full min-w-0">
      <Skeleton className={`h-8 ${titleWidth} rounded-md`} aria-hidden />
      <div className="mt-4 flex gap-3 overflow-hidden pb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-44 w-32 shrink-0 rounded-md sm:h-[13.5rem] sm:w-[8.5rem]"
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

export function HomeFeedSkeleton() {
  return (
    <div
      className="w-full min-w-0 space-y-6 px-4 pt-2 pb-8 sm:space-y-8 sm:px-5 sm:pb-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12"
      aria-busy="true"
      aria-label="Loading rows"
    >
      <RowSkeleton titleWidth="w-40" />
      <RowSkeleton titleWidth="w-36" />
      <RowSkeleton titleWidth="w-44" />
    </div>
  );
}
