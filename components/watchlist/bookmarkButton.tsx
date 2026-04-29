'use client';

import { useEffect, useState, useTransition } from 'react';

import { toggleWatchlistAction } from '@/lib/actions/watchlist';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { WatchlistSignInHint } from '@/components/watchlist/watchlist-sign-in-hint';

const SIGN_IN_HINT_MS = 7000;

export function BookmarkButton({
  initialIsSaved,
  mediaType,
  mediaId,
  title,
}: {
  mediaType: 'movie' | 'tv';
  mediaId: string;
  title: string;
  initialIsSaved: boolean;
}) {
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
    <div className="absolute top-2 right-2 z-10 flex max-w-[min(13rem,calc(100%-1rem))] flex-col items-end gap-1.5">
      {signInHint ? <WatchlistSignInHint compact /> : null}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="shrink-0 rounded-full bg-black/50 p-2 backdrop-blur-md transition-colors hover:bg-black/70"
      >
        <motion.div
          initial={false}
          animate={{
            scale: saved ? [1, 1.3, 1] : 1,
            color: saved ? '#ef4444' : '#fff',
          }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark fill={saved ? 'currentColor' : 'none'} size={20} />
        </motion.div>
      </button>
    </div>
  );
}
