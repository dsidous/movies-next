'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

import { BookmarkButton } from '../watchlist/bookmarkButton';

const HOVER_SCALE_DELAY_MS = 220;

const posterSizes =
  '(max-width: 480px) 44vw, (max-width: 640px) 36vw, (max-width: 1024px) 24vw, (max-width: 1536px) 18vw, 15vw';

type MediaCardProps = {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
  type: 'movie' | 'tv';
  isWatchlisted?: boolean;
  voteAverage?: number;
  voteCount?: number;
  subtitle?: string;
  className?: string;
};

export function MediaCard({
  id,
  title,
  year,
  posterUrl,
  type,
  isWatchlisted = false,
  voteAverage,
  voteCount,
  subtitle,
  className,
}: MediaCardProps) {
  const href = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
  const [showHoverScale, setShowHoverScale] = useState(false);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, []);

  const clearHoverDelay = () => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  };

  const onPointerEnter = () => {
    clearHoverDelay();
    delayRef.current = setTimeout(() => {
      setShowHoverScale(true);
      delayRef.current = null;
    }, HOVER_SCALE_DELAY_MS);
  };

  const onPointerLeave = () => {
    clearHoverDelay();
    setShowHoverScale(false);
  };

  const onPointerCancel = () => {
    clearHoverDelay();
    setShowHoverScale(false);
  };

  const hasRating =
    typeof voteCount === 'number' && voteCount > 0 && typeof voteAverage === 'number';
  const ratingLabel = hasRating ? `, rated ${voteAverage.toFixed(1)} out of 10` : '';

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={year ? `${title} (${year})${ratingLabel}` : `${title}${ratingLabel}`}
      className={cn(
        'group relative block shrink-0 cursor-pointer snap-start no-underline select-none',
        'w-[clamp(6rem,min(10.5rem,38vw),10.5rem)]',
        'min-[480px]:w-[clamp(6.5rem,min(12rem,32vw),12rem)]',
        'sm:w-[clamp(6.75rem,min(12.5rem,28vw),12.5rem)]',
        'md:w-[clamp(7.25rem,min(14rem,22vw),14rem)]',
        'lg:w-[clamp(7.5rem,min(15rem,18.5vw),15rem)]',
        'xl:w-[clamp(7.75rem,min(16rem,16vw),16rem)]',
        '2xl:w-[clamp(8rem,min(17rem,14vw),17rem)]',
        'rounded-md ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
    >
      <BookmarkButton
        key={`${type}-${id}-${isWatchlisted}`}
        mediaType={type}
        mediaId={id.toString()}
        title={title}
        initialIsSaved={isWatchlisted}
      />
      <div
        className={cn(
          'relative aspect-2/3 overflow-hidden rounded-md bg-muted shadow transition-transform duration-200',
          showHoverScale && 'scale-[1.03]',
          'group-focus-visible:scale-[1.03]',
        )}
      >
        <Image
          src={posterUrl}
          alt={title}
          width={500}
          height={750}
          sizes={posterSizes}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
        />
        {hasRating && (
          <div
            className="absolute right-1 bottom-1 z-10 flex items-center gap-0.5 rounded-sm bg-zinc-950/85 px-1 py-0.5 text-[10px] font-semibold text-amber-300 tabular-nums ring-1 ring-white/10 sm:right-1.5 sm:bottom-1.5 sm:px-1.5 sm:text-xs"
            aria-hidden
          >
            <Star className="size-2.5 shrink-0 fill-amber-400 text-amber-400 sm:size-3" />
            {voteAverage.toFixed(1)}
          </div>
        )}
      </div>
      <p className="mt-1.5 flex min-w-0 items-baseline gap-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
        <span className="min-w-0 shrink truncate">{title}</span>
        {year ? <span className="shrink-0 tabular-nums">· {year}</span> : null}
      </p>
      {subtitle ? (
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground/90 sm:text-xs">
          {subtitle}
        </p>
      ) : null}
    </Link>
  );
}
