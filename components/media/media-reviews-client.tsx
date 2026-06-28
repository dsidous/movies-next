'use client';

import { useCallback, useState } from 'react';

import { getMediaReviewsAction } from '@/lib/actions/reviews';
import { PREVIEW_INITIAL } from '@/lib/media-review-helpers';
import { cn } from '@/lib/utils';
import type { MovieReviewItem } from '@services/tmdb/movie/schema';
import { Loader2 } from 'lucide-react';

import { ReviewCard } from '@/components/media/review-card';
import { Button } from '@/components/ui/button';

type MediaReviewsClientProps = {
  media: 'movie' | 'tv';
  mediaId: number;
  imageBaseUrl: string;
  page1Reviews: MovieReviewItem[];
  initialPage: number;
  totalPages: number;
  totalResults: number;
  className?: string;
};

export function MediaReviewsClient({
  media,
  mediaId,
  imageBaseUrl,
  page1Reviews,
  initialPage,
  totalPages,
  totalResults,
  className,
}: MediaReviewsClientProps) {
  const [reviews, setReviews] = useState(() => page1Reviews.slice(0, PREVIEW_INITIAL));
  const [page, setPage] = useState(initialPage);
  const [page1FullyShown, setPage1FullyShown] = useState(page1Reviews.length <= PREVIEW_INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = !page1FullyShown || page < totalPages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    if (!page1FullyShown) {
      setReviews(page1Reviews);
      setPage1FullyShown(true);
      setLoading(false);
      return;
    }

    const nextPage = page + 1;
    const res = await getMediaReviewsAction(media, mediaId, nextPage);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setReviews((prev) => [...prev, ...res.data.results]);
    setPage(res.data.page);
    setLoading(false);
  }, [hasMore, loading, media, mediaId, page, page1FullyShown, page1Reviews]);

  if (reviews.length === 0) return null;

  return (
    <div className={cn('min-w-0', className)}>
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li
            key={review.id ?? `${review.author}-${review.created_at}`}
            className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/40"
          >
            <ReviewCard review={review} imageBaseUrl={imageBaseUrl} />
          </li>
        ))}
      </ul>

      {error ? <p className="mt-3 text-sm text-red-400/90">{error}</p> : null}

      {hasMore ? (
        <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="border-zinc-700 bg-zinc-900/60 text-zinc-100 hover:bg-zinc-800"
            disabled={loading}
            onClick={() => void loadMore()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              'Show more reviews'
            )}
          </Button>
          <p className="text-sm text-zinc-500">
            Showing {reviews.length} of {totalResults}
          </p>
        </div>
      ) : null}
    </div>
  );
}
