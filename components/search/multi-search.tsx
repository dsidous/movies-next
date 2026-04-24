'use client';

import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import type { SearchMultiResult } from '@services/tmdb';
import { searchMultiAction } from '@/lib/actions/search';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

function resultHref(r: SearchMultiResult) {
  switch (r.media_type) {
    case 'movie':
      return `/movie/${r.id}`;
    case 'tv':
      return `/tv/${r.id}`;
    case 'person':
      return `/person/${r.id}`;
    default:
      return '/';
  }
}

function resultLabel(r: SearchMultiResult): string {
  if (r.media_type === 'movie' && typeof r.title === 'string' && r.title) return r.title;
  if (typeof r.name === 'string' && r.name) return r.name;
  if (typeof r.title === 'string' && r.title) return r.title;
  return 'Untitled';
}

function resultSubtitle(r: SearchMultiResult): string {
  if (r.media_type === 'movie') {
    return r.releaseYear ? `Movie · ${r.releaseYear}` : 'Movie';
  }
  if (r.media_type === 'tv') {
    return r.firstAirYear ? `TV · ${r.firstAirYear}` : 'TV';
  }
  if (r.media_type === 'person') {
    return 'Person';
  }
  return String(r.media_type);
}

function resultImageUrl(r: SearchMultiResult) {
  if (r.media_type === 'person' && r.profileUrl) {
    return r.profileUrl;
  }
  if (r.posterUrl) {
    return r.posterUrl;
  }
  return null;
}

const DEBOUNCE_MS = 300;

export function MultiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMultiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [fetched, setFetched] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    const t = q.trim();
    if (!t) return;
    setLoading(true);
    setError(null);
    setFetched(false);
    try {
      const result = await searchMultiAction(t, 1);
      if (!result.ok) {
        setError(result.error);
        setResults([]);
        return;
      }
      setResults(result.data.results);
    } catch {
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  const onQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setError(null);
      setFetched(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) return;
    const id = setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query, runSearch]);

  const showPopover = focused && query.trim().length > 0;

  return (
    <Popover
      open={showPopover}
      onOpenChange={(o) => {
        if (!o) setFocused(false);
      }}
    >
      <PopoverAnchor asChild>
        <div
          className={cn(
            'flex max-w-md min-w-0 items-center gap-2 rounded-md border bg-background px-3 shadow-xs',
            'has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              // Delay so CommandItem mousedown can fire before we hide.
              setTimeout(() => setFocused(false), 150);
            }}
            placeholder="Search movies, TV, people…"
            className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-label="Search"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="p-0"
        align="end"
        sideOffset={6}
        style={{ width: 'var(--radix-popover-anchor-width)' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="max-h-80" shouldFilter={false}>
          <CommandList>
            {loading && (
              <div className="space-y-2 p-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {error && !loading && <div className="p-3 text-sm text-destructive">{error}</div>}
            {!loading && !error && fetched && results.length === 0 && (
              <CommandEmpty>No results for &ldquo;{query.trim()}&rdquo;</CommandEmpty>
            )}
            {!loading &&
              !error &&
              results.map((r) => {
                const href = resultHref(r);
                const label = resultLabel(r);
                const sub = resultSubtitle(r);
                const src = resultImageUrl(r);
                return (
                  <CommandItem key={`${r.media_type}-${r.id}`} className="p-0" asChild>
                    <Link
                      href={href}
                      className="flex items-center gap-2 px-2 py-2"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div
                        className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-muted"
                        aria-hidden
                      >
                        {src ? (
                          <Image src={src} alt="" fill className="object-cover" sizes="36px" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate leading-tight font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{sub}</div>
                      </div>
                    </Link>
                  </CommandItem>
                );
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
