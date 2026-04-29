'use client';

import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { WatchlistSignInHint } from '@/components/watchlist/watchlist-sign-in-hint';
import { toggleWatchlistAction } from '@/lib/actions/watchlist';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SIGN_IN_HINT_MS = 8000;

type HeroMyListButtonProps = {
  mediaType: 'movie' | 'tv';
  mediaId: string;
  title: string;
  initialIsSaved: boolean;
  className?: string;
};

export function HeroMyListButton({
  mediaType,
  mediaId,
  title,
  initialIsSaved,
  className,
}: HeroMyListButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialIsSaved);
  const [signInHint, setSignInHint] = useState(false);

  useEffect(() => {
    if (!signInHint) return;
    const t = window.setTimeout(() => setSignInHint(false), SIGN_IN_HINT_MS);
    return () => window.clearTimeout(t);
  }, [signInHint]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let previous = false;
    setSaved((current) => {
      previous = current;
      return !current;
    });
    setSignInHint(false);
    startTransition(async () => {
      try {
        const result = await toggleWatchlistAction(mediaType, mediaId, title);
        if (!result.ok && result.code === 'unauthenticated') {
          setSaved(previous);
          setSignInHint(true);
          return;
        }
        router.refresh();
      } catch {
        setSaved(previous);
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="secondary"
        className={cn(
          'border-zinc-600 bg-zinc-800/80 text-white hover:bg-zinc-700/90',
          className,
        )}
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={saved}
      >
        {saved ? (
          <Check className="size-5 shrink-0" aria-hidden />
        ) : (
          <Plus className="size-5 shrink-0" aria-hidden />
        )}
        My List
      </Button>
      {signInHint ? <WatchlistSignInHint /> : null}
    </div>
  );
}
