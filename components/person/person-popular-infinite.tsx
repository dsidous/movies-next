'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { PersonPopularListItem } from '@services/tmdb/person/schema';

import { getPopularPeoplePageAction } from '@/lib/actions/person';
import { PersonPopularGrid } from '@/components/person/person-popular-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export type PopularPeoplePagePayload = {
  page: number;
  total_pages: number;
  total_results: number;
  results: PersonPopularListItem[];
};

type PersonPopularInfiniteProps = {
  initial: PopularPeoplePagePayload;
};

async function fetchPopularPage(pageParam: number): Promise<PopularPeoplePagePayload> {
  const result = await getPopularPeoplePageAction(pageParam);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data;
}

function LoadingMoreSkeleton() {
  return (
    <div
      className="grid w-full grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-3 sm:gap-4 md:gap-5 xl:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]"
      aria-busy="true"
      aria-label="Loading more people"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-full max-w-80 min-w-0 justify-self-start sm:max-w-88 md:max-w-104 lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
          <Skeleton className="aspect-2/3 w-full rounded-2xl" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PersonPopularInfinite({ initial }: PersonPopularInfiniteProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['person', 'popular'],
    queryFn: ({ pageParam }) => fetchPopularPage(pageParam),
    initialPageParam: 1,
    initialData: {
      pages: [initial],
      pageParams: [1],
    },
    staleTime: Infinity,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage === true && isFetchingNextPage === false) {
          void fetchNextPage();
        }
      },
      { rootMargin: '400px', threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  /** If the viewport is tall enough that the sentinel stays in view after a page loads, load again until it scrolls off or the list ends. */
  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 400;
    const inView = rect.top < window.innerHeight + margin && rect.bottom > -margin;
    if (inView) void fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, data.pages.length]);

  const people = data.pages.flatMap((p) => p.results);

  return (
    <div className="flex flex-col gap-8">
      <PersonPopularGrid people={people} />

      {isError ? (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : null}

      {isFetchingNextPage ? <LoadingMoreSkeleton /> : null}

      <div ref={sentinelRef} className="min-h-px w-full shrink-0" aria-hidden />

      {hasNextPage === false && people.length > 0 ? (
        <p className="text-center text-xs text-zinc-500">End of list</p>
      ) : null}
    </div>
  );
}
