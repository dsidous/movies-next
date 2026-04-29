'use client';

import { SignInButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WatchlistSignInHintProps = {
  className?: string;
  /** Poster overlay: smaller type and tight padding */
  compact?: boolean;
};

export function WatchlistSignInHint({ className, compact }: WatchlistSignInHintProps) {
  return (
    <div
      role="status"
      className={cn(
        compact
          ? 'max-w-52 rounded-md border border-white/15 bg-black/85 px-2.5 py-2 text-left text-[11px] leading-snug text-zinc-100 shadow-lg backdrop-blur-sm'
          : 'max-w-md rounded-md border border-zinc-600 bg-zinc-900/95 px-3 py-2.5 text-sm leading-snug text-zinc-200 shadow-md',
        className,
      )}
    >
      <SignInButton mode="modal">
        <Button
          type="button"
          variant="link"
          className={cn(
            'h-auto p-0 font-semibold text-amber-300 hover:text-amber-200',
            compact ? 'text-[11px]' : 'text-sm',
          )}
        >
          Sign in
        </Button>
      </SignInButton>
      <span className={compact ? 'text-zinc-300' : 'text-zinc-400'}>
        {' '}
        to save titles to your watchlist.
      </span>
    </div>
  );
}
