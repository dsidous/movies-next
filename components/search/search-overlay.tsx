'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { searchMultiAction } from '@/lib/actions/search';
import { cn } from '@/lib/utils';
import type { SearchMultiResult } from '@services/tmdb';
import { Search, X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { SearchResultsPanel } from '@/components/search/search-results-panel';
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';

const SEARCH_PLACEHOLDER = 'Search movies, TV shows, and people…';

const DEBOUNCE_MS = 300;

interface SearchOverlayInnerProps {
  onOpenChange: (open: boolean) => void;
}

function SearchOverlayInner({ onOpenChange }: SearchOverlayInnerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMultiResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const hasResults = loading || error || (fetched && results.length === 0) || results.length > 0;

  const searchInput = (
    <>
      <Search className="size-6 shrink-0 text-muted-foreground sm:size-7" aria-hidden />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={SEARCH_PLACEHOLDER}
        className="h-12 min-w-0 flex-1 bg-transparent text-xl font-light tracking-tight outline-none placeholder:font-light placeholder:text-muted-foreground sm:h-14 sm:text-3xl"
        aria-label="Search"
        autoComplete="off"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-5" />
        </button>
      )}
    </>
  );

  return (
    <DialogPrimitive.Content
      className={cn(
        'fixed inset-0 z-51 flex flex-col overflow-hidden outline-none',
        'bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80',
        'data-[state=open]:animate-in data-[state=open]:duration-200 data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=closed]:fade-out-0',
      )}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        inputRef.current?.focus();
      }}
      onPointerDownOutside={(e) => e.preventDefault()}
      onInteractOutside={(e) => e.preventDefault()}
    >
      <DialogTitle className="sr-only">Search</DialogTitle>

      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 z-10 flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:top-6 sm:right-6"
        aria-label="Close search"
      >
        <span>Close</span>
        <kbd className="font-mono">Esc</kbd>
      </button>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-[10vh] z-10 shrink-0 px-4 sm:px-6">
          <div className="pointer-events-auto mx-auto flex w-full max-w-2xl items-center gap-3 sm:gap-4">
            {searchInput}
          </div>
        </div>

        {hasResults && (
          <div className="absolute inset-x-0 top-[calc(10vh+4rem)] bottom-[10vh] z-0 px-3 sm:px-4">
            <div className="mx-auto h-full max-w-2xl pt-4">
              <SearchResultsPanel
                loading={loading}
                error={error}
                fetched={fetched}
                query={query}
                results={results}
                onClose={() => onOpenChange(false)}
              />
            </div>
          </div>
        )}
      </div>
    </DialogPrimitive.Content>
  );
}

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overlayKey: number;
}

export function SearchOverlay({ open, onOpenChange, overlayKey }: SearchOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:duration-200 data-[state=open]:fade-in-0" />
        <SearchOverlayInner key={overlayKey} onOpenChange={onOpenChange} />
      </DialogPortal>
    </Dialog>
  );
}

export function useSearchShortcut() {
  const [open, setOpen] = useState(false);
  const [overlayKey, setOverlayKey] = useState(0);
  const prevOpenRef = useRef(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !prevOpenRef.current) {
      setOverlayKey((k) => k + 1);
    }
    prevOpenRef.current = nextOpen;
    setOpen(nextOpen);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const next = !prevOpenRef.current;
        if (next) setOverlayKey((k) => k + 1);
        prevOpenRef.current = next;
        setOpen(next);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen: handleOpenChange, overlayKey };
}
