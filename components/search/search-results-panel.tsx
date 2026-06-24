'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { SearchMultiResult } from '@services/tmdb';
import { Search } from 'lucide-react';

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
    return r.releaseYear ? `Movie \u00b7 ${r.releaseYear}` : 'Movie';
  }
  if (r.media_type === 'tv') {
    return r.firstAirYear ? `TV \u00b7 ${r.firstAirYear}` : 'TV';
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

interface SearchResultsPanelProps {
  loading: boolean;
  error: string | null;
  fetched: boolean;
  query: string;
  results: SearchMultiResult[];
  onClose: () => void;
  className?: string;
}

const SCROLLBAR_HIDE_DELAY_MS = 800;

export function SearchResultsPanel({
  loading,
  error,
  fetched,
  query,
  results,
  onClose,
  className,
}: SearchResultsPanelProps) {
  const [showScrollbar, setShowScrollbar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hideScrollbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scheduleHideScrollbar = () => {
      if (hideScrollbarTimeoutRef.current) {
        clearTimeout(hideScrollbarTimeoutRef.current);
      }
      hideScrollbarTimeoutRef.current = setTimeout(() => {
        setShowScrollbar(false);
        hideScrollbarTimeoutRef.current = null;
      }, SCROLLBAR_HIDE_DELAY_MS);
    };

    const revealScrollbar = () => {
      setShowScrollbar(true);
      scheduleHideScrollbar();
    };

    const onWheel = (e: WheelEvent) => {
      revealScrollbar();

      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) return;

      const atTop = scrollTop <= 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (atTop || atBottom) {
        e.preventDefault();
      }
    };

    el.addEventListener('scroll', revealScrollbar, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', revealScrollbar, { passive: true });
    return () => {
      el.removeEventListener('scroll', revealScrollbar);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', revealScrollbar);
      if (hideScrollbarTimeoutRef.current) {
        clearTimeout(hideScrollbarTimeoutRef.current);
      }
    };
  }, [loading, error, fetched, results.length]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'h-full overflow-y-auto overscroll-contain pb-2',
        '[scrollbar-gutter:stable] [scrollbar-width:thin]',
        '[scrollbar-color:color-mix(in_oklab,var(--border)_60%,transparent)_transparent]',
        '[&::-webkit-scrollbar]:w-2',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/60',
        !showScrollbar && '[scrollbar-color:transparent_transparent] [&::-webkit-scrollbar-thumb]:invisible',
        showScrollbar && '[&::-webkit-scrollbar-thumb]:visible',
        className,
      )}
    >
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl px-3 py-3 sm:px-4 sm:py-4">
              <Skeleton className="size-16 shrink-0 rounded-xl sm:size-18" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && !loading && (
        <div className="py-12 text-center text-sm text-destructive">{error}</div>
      )}
      {!loading && !error && fetched && results.length === 0 && query.trim() && (
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-lg text-muted-foreground sm:text-xl">
            No results for &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80">Try a different title or name</p>
        </div>
      )}
      {!loading && !error && results.length > 0 && (
        <div role="listbox" aria-label="Search results">
          <p className="mb-3 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Results
          </p>
          <ul className="space-y-0.5">
            {results.map((r) => {
              const href = resultHref(r);
              const label = resultLabel(r);
              const sub = resultSubtitle(r);
              const src = resultImageUrl(r);
              return (
                <li key={`${r.media_type}-${r.id}`}>
                  <Link
                    href={href}
                    prefetch={false}
                    role="option"
                    className="flex w-full items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-accent/80 sm:gap-5 sm:px-4 sm:py-4"
                    onClick={onClose}
                  >
                    <div
                      className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm sm:size-18"
                      aria-hidden
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 64px, 72px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Search className="size-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-medium leading-snug sm:text-lg">
                        {label}
                      </div>
                      <div className="text-sm text-muted-foreground">{sub}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
