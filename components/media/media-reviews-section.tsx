import { cn } from '@/lib/utils';
import type { MovieReviewsResponse } from '@services/tmdb/movie/schema';

import { MediaReviewsClient } from '@/components/media/media-reviews-client';

type MediaReviewsSectionProps = {
  media: 'movie' | 'tv';
  mediaId: number;
  reviews: MovieReviewsResponse | null;
  imageBaseUrl: string;
  className?: string;
};

export function MediaReviewsSection({
  media,
  mediaId,
  reviews,
  imageBaseUrl,
  className,
}: MediaReviewsSectionProps) {
  if (!reviews || reviews.total_results < 1 || reviews.results.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('mx-auto min-w-0 w-full max-w-6xl', className)}
      aria-labelledby="media-reviews-heading"
    >
      <h2
        id="media-reviews-heading"
        className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg"
      >
        Reviews
        <span className="font-normal text-zinc-400"> · {reviews.total_results}</span>
      </h2>
      <div className="mt-4">
        <MediaReviewsClient
          media={media}
          mediaId={mediaId}
          imageBaseUrl={imageBaseUrl}
          page1Reviews={reviews.results}
          initialPage={reviews.page}
          totalPages={reviews.total_pages}
          totalResults={reviews.total_results}
        />
      </div>
    </section>
  );
}
