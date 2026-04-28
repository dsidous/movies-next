'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { MoviesDiscoverFilters } from '@/lib/actions/discover';
import { discoverMoviesPageAction } from '@/lib/actions/discover';
import type { MovieListItem } from '@services/tmdb/movie/schema';

import { MovieDiscoverCard } from '@/components/movies/movie-discover-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export type DiscoverMoviesPayload = {
  page: number;
  total_pages: number;
  total_results: number;
  results: MovieListItem[];
};

function moviesFilterQueryKey(filters: MoviesDiscoverFilters) {
  return {
    sort: filters.sort,
    genreIds: [...filters.genreIds].sort((a, b) => a - b),
    year: filters.year,
    voteGreaterThan: filters.voteGreaterThan,
  } as const;
}

async function fetchDiscoverMoviesPage(
  filters: MoviesDiscoverFilters,
  pageParam: number,
): Promise<DiscoverMoviesPayload> {
  const result = await discoverMoviesPageAction(filters, pageParam);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

function LoadingMoreSkeleton() {
  return (
    <div
      className="grid w-full grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-3 sm:gap-4"
      aria-busy="true"
      aria-label="Loading more movies"
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

type MoviesDiscoverInfiniteProps = {
  initial: DiscoverMoviesPayload;
  filters: MoviesDiscoverFilters;
  genreMap: Map<number, string>;
};

export function MoviesDiscoverInfinite({ initial, filters, genreMap }: MoviesDiscoverInfiniteProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filterKey = moviesFilterQueryKey(filters);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['discover', 'movies', filterKey] as const,
    queryFn: ({ pageParam }) => fetchDiscoverMoviesPage(filters, pageParam),
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

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 400;
    const inView = rect.top < window.innerHeight + margin && rect.bottom > -margin;
    if (inView) void fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, data.pages.length]);

  const movies = data.pages.flatMap((p) => p.results);
  const totalResults = data.pages[0]?.total_results ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <ul
        className="grid w-full list-none grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] content-start justify-items-stretch gap-3 sm:gap-4"
        role="list"
      >
        {movies.map((movie) => (
          <li
            key={movie.id}
            className="w-full max-w-full min-w-0 only:max-w-148 only:justify-self-start"
          >
            <MovieDiscoverCard movie={movie} genreMap={genreMap} />
          </li>
        ))}
      </ul>

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

      <nav
        className="flex flex-col gap-2 border-t border-border/70 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        aria-live="polite"
      >
        <p>
          Loaded{' '}
          <span className="tabular-nums text-foreground">{movies.length.toLocaleString()}</span>
          {totalResults > 0 ? (
            <>
              {' '}
              of <span className="tabular-nums text-foreground">{totalResults.toLocaleString()}</span>{' '}
              titles
            </>
          ) : null}
        </p>
      </nav>

      {isFetchingNextPage ? <LoadingMoreSkeleton /> : null}

      <div ref={sentinelRef} className="min-h-px w-full shrink-0" aria-hidden />

      {hasNextPage === false && movies.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">End of results</p>
      ) : null}
    </div>
  );
}
