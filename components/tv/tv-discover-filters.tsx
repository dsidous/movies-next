'use client';

import { type ComponentProps, useCallback, useMemo, useTransition } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import type { TvBrowseSearchState } from '@/lib/tv-discover-search-params';
import {
  TV_DISCOVER_SORT_OPTIONS,
  serializeTvBrowseSearchParams,
} from '@/lib/tv-discover-search-params';
import { cn } from '@/lib/utils';
import type { Genre } from '@services/tmdb';
import { ChevronDown, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const TV_DISCOVER_RATING_GREATER_THAN_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Any rating' },
  { value: '5', label: 'Greater than 5' },
  { value: '6', label: 'Greater than 6' },
  { value: '7', label: 'Greater than 7' },
  { value: '8', label: 'Greater than 8' },
  { value: '9', label: 'Greater than 9' },
];

function navigateToState(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  next: TvBrowseSearchState,
) {
  const qs = serializeTvBrowseSearchParams(next);
  router.push(`${pathname}${qs}`, { scroll: false });
}

const filterSelectClass = cn(
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs',
  'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  'dark:bg-input/30',
);

const nativeFilterSelectClass = cn(
  filterSelectClass,
  'appearance-none bg-background pr-9 text-left font-normal shadow-xs transition-colors',
  'hover:bg-accent hover:text-accent-foreground',
  'cursor-pointer dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
);

function NativeFilterSelect({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative w-full">
      <select className={cn(nativeFilterSelectClass, className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 opacity-60"
        aria-hidden
      />
    </div>
  );
}

type TvDiscoverFiltersProps = {
  genres: Genre[];
  state: TvBrowseSearchState;
  className?: string;
};

export function TvDiscoverFilters({ genres, state, className }: TvDiscoverFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const sortedGenres = useMemo(
    () => [...genres].sort((a, b) => a.name.localeCompare(b.name)),
    [genres],
  );

  const genreNameById = useMemo(
    () => new Map(sortedGenres.map((g) => [g.id, g.name])),
    [sortedGenres],
  );

  const airYears = useMemo(() => {
    const end = new Date().getFullYear();
    const years: number[] = [];
    for (let y = end; y >= 1874; y--) years.push(y);
    return years;
  }, []);

  const push = useCallback(
    (next: TvBrowseSearchState) => {
      startTransition(() => navigateToState(router, pathname, next));
    },
    [router, pathname],
  );

  const toggleGenre = (id: number) => {
    const next = new Set(state.genreIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    push({
      ...state,
      page: 1,
      genreIds: [...next].sort((a, b) => a - b),
    });
  };

  const genreTriggerLabel = (() => {
    if (state.genreIds.length === 0) return 'All genres';
    const names = state.genreIds.map((id) => genreNameById.get(id)).filter(Boolean) as string[];
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, ${names[1]}`;
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
  })();

  const clearFilters = () => {
    push({
      page: 1,
      sort: 'popularity.desc',
      genreIds: [],
      year: null,
      voteGreaterThan: null,
    });
  };

  const hasExtraFilters =
    state.genreIds.length > 0 ||
    state.year !== null ||
    state.voteGreaterThan !== null ||
    state.sort !== 'popularity.desc';

  const ratingSelectValue =
    state.voteGreaterThan != null &&
    TV_DISCOVER_RATING_GREATER_THAN_OPTIONS.some((o) => o.value === String(state.voteGreaterThan))
      ? String(state.voteGreaterThan)
      : '';

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-muted/40 p-4 shadow-sm backdrop-blur-sm md:p-5',
        pending && 'opacity-80',
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <label className="flex flex-col gap-1.5 lg:col-span-3">
            <span className="text-xs font-medium text-muted-foreground">Sort by</span>
            <NativeFilterSelect
              value={state.sort}
              onChange={(e) =>
                push({
                  ...state,
                  page: 1,
                  sort: e.target.value,
                })
              }
            >
              {TV_DISCOVER_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeFilterSelect>
          </label>

          <label className="flex flex-col gap-1.5 lg:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">First air year</span>
            <NativeFilterSelect
              value={state.year === null ? '' : String(state.year)}
              onChange={(e) => {
                const raw = e.target.value;
                push({
                  ...state,
                  page: 1,
                  year: raw === '' ? null : Number.parseInt(raw, 10),
                });
              }}
            >
              <option value="">Any year</option>
              {airYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </NativeFilterSelect>
          </label>

          <label className="flex flex-col gap-1.5 lg:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Rating</span>
            <NativeFilterSelect
              value={ratingSelectValue}
              onChange={(e) => {
                const raw = e.target.value;
                push({
                  ...state,
                  page: 1,
                  voteGreaterThan: raw === '' ? null : Number.parseFloat(raw),
                });
              }}
            >
              {TV_DISCOVER_RATING_GREATER_THAN_OPTIONS.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeFilterSelect>
          </label>

          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-5">
            <span className="text-xs font-medium text-muted-foreground" id="tv-genres-label">
              Genres
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    filterSelectClass,
                    'inline-flex items-center justify-between gap-2 font-normal',
                  )}
                  aria-labelledby="tv-genres-label"
                  aria-haspopup="dialog"
                >
                  <span className="min-w-0 truncate text-left">{genreTriggerLabel}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={4}
                className="w-[min(100vw-2rem,20rem)] p-0"
                aria-labelledby="tv-genres-label"
              >
                <PopoverTitle className="sr-only">Choose one or more genres</PopoverTitle>
                <ScrollArea className="h-64">
                  <div className="p-2 pr-3" role="group" aria-label="Genre filters">
                    <ul className="space-y-0.5 p-0">
                      {sortedGenres.map((g) => {
                        const checked = state.genreIds.includes(g.id);
                        return (
                          <li key={g.id}>
                            <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-accent">
                              <input
                                type="checkbox"
                                className="size-4 shrink-0 rounded border-input accent-primary"
                                checked={checked}
                                onChange={() => toggleGenre(g.id)}
                              />
                              <span className="leading-snug">{g.name}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 lg:self-end"
          disabled={!hasExtraFilters}
          onClick={clearFilters}
          aria-label="Reset filters"
          title="Reset filters"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
