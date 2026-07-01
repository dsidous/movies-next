'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import {
  formatReviewDate,
  resolveReviewAvatarUrl,
  reviewAuthorInitials,
  reviewAuthorName,
} from '@/lib/media-review-helpers';
import { REVIEW_EXPAND_THRESHOLD, reviewPlainTextLength } from '@/lib/review-content';
import type { MovieReviewItem } from '@services/tmdb/movie/schema';
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

const ReviewContentBody = dynamic(
  () => import('@/components/media/review-content').then((mod) => mod.ReviewContentBody),
  { ssr: false },
);

type ReviewCardProps = {
  review: MovieReviewItem;
  imageBaseUrl: string;
};

function ReviewAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initials = reviewAuthorInitials(name);
  const isExternal =
    avatarUrl != null &&
    (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'));

  if (avatarUrl && isExternal) {
    return (
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700/80 sm:size-11">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (avatarUrl) {
    return (
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700/80 sm:size-11">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-700/80 sm:size-11 sm:text-sm"
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function ReviewCard({ review, imageBaseUrl }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const name = reviewAuthorName(review.author, review.author_details?.name);
  const date = formatReviewDate(review.created_at);
  const rating = review.author_details?.rating;
  const content = review.content?.trim() ?? '';
  const avatarUrl = resolveReviewAvatarUrl(review.author_details?.avatar_path, imageBaseUrl);
  const showExpand = reviewPlainTextLength(content) > REVIEW_EXPAND_THRESHOLD;

  return (
    <article className="p-4 sm:px-5 sm:py-4">
      <header className="flex gap-3 sm:gap-4">
        <ReviewAvatar name={name} avatarUrl={avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium text-zinc-100 sm:text-base">{name}</p>
            {date ? <p className="text-xs text-zinc-500 sm:text-sm">{date}</p> : null}
          </div>
          {typeof rating === 'number' && rating > 0 ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-300/90 sm:text-sm">
              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
              <span>
                {rating.toFixed(1)}
                <span className="text-zinc-500"> / 10</span>
              </span>
            </p>
          ) : null}
        </div>
      </header>

      {content ? (
        <div className="mt-3 sm:mt-4">
          <ReviewContentBody content={content} expanded={expanded} />
          {showExpand ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-auto p-0 text-xs text-amber-300/90 hover:bg-transparent hover:text-amber-200 focus-visible:ring-0 sm:text-sm"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
