'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SearchTriggerProps {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="hidden h-9 w-auto max-w-xs shrink-0 items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground shadow-xs transition-all hover:border-border hover:bg-muted/60 md:flex"
        aria-label="Search"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left">
          Search movies, TV shows, and people…
        </span>
        <kbd className="pointer-events-none shrink-0 rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-xs">
          <abbr title="Command" className="no-underline">
            &#8984;
          </abbr>
          K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={onClick}
        aria-label="Search"
      >
        <Search className="size-5" />
      </Button>
    </>
  );
}
