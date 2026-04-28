import Link from 'next/link';

import type { TvBrowseSearchState } from '@/lib/tv-discover-search-params';
import { serializeTvBrowseSearchParams } from '@/lib/tv-discover-search-params';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

function hrefForPage(state: TvBrowseSearchState, page: number): string {
  const next = { ...state, page };
  const qs = serializeTvBrowseSearchParams(next);
  return `/tv${qs}`;
}

type TvDiscoverPaginationProps = {
  state: TvBrowseSearchState;
  totalPages: number;
  totalResults: number;
  className?: string;
};

export function TvDiscoverPagination({
  state,
  totalPages,
  totalResults,
  className,
}: TvDiscoverPaginationProps) {
  const page = Math.min(state.page, Math.max(1, totalPages));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      className={cn(
        'flex flex-col gap-4 border-t border-border/70 pt-8 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing page{' '}
        <span className="tabular-nums text-foreground">
          {page} of {Math.max(1, totalPages)}
        </span>
        <span className="mx-1">·</span>
        <span className="tabular-nums">{totalResults.toLocaleString()}</span> series
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {prevPage !== null ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefForPage(state, prevPage)} className="gap-1">
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="gap-1">
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </Button>
        )}
        {nextPage !== null ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefForPage(state, nextPage)} className="gap-1">
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="gap-1">
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </nav>
  );
}
