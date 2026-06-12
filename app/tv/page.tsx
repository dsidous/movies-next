import type { Metadata } from 'next';

import type { TvDiscoverFilters as TvDiscoverFilterParams } from '@/lib/actions/discover';
import { SITE_NAME } from '@/lib/constants/site';
import {
  parseTvBrowseSearchParams,
  serializeTvBrowseSearchParams,
  tvBrowseStateToDiscoverQuery,
} from '@/lib/tv-discover-search-params';
import { getWatchlistedKeys } from '@/lib/watchlisted-keys';
import { discoverTv, getTvGenres } from '@services/tmdb';

import { TvDiscoverFilters } from '@/components/tv/tv-discover-filters';
import { TvDiscoverInfinite } from '@/components/tv/tv-discover-infinite';

export const metadata: Metadata = {
  title: `Browse TV series | ${SITE_NAME}`,
  description:
    'Discover TV shows from TMDB — sort by popularity, rating, or first air date, filter by genre, year, and score.',
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TvDiscoverPage({ searchParams }: PageProps) {
  const raw = (await searchParams) ?? {};
  const browseState = parseTvBrowseSearchParams(raw);
  const filters: TvDiscoverFilterParams = {
    sort: browseState.sort,
    genreIds: browseState.genreIds,
    year: browseState.year,
    voteGreaterThan: browseState.voteGreaterThan,
  };
  const query = tvBrowseStateToDiscoverQuery({ ...filters, page: 1 });

  const [genres, data, watchlistedKeys] = await Promise.all([
    getTvGenres(),
    discoverTv(query),
    getWatchlistedKeys(),
  ]);

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  const discoverKey = serializeTvBrowseSearchParams({ ...browseState, page: 1 });

  const pagePad = 'px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12';

  return (
    <div className="w-full min-w-0 pt-6 pb-10">
      <header className={`w-full space-y-2 ${pagePad}`}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">TV series</h1>
        <p className="text-muted-foreground">
          Explore shows with filters for sort order, genres, first air year, and minimum rating.
          Results come from TMDB&apos;s discover API and update when you change settings.
        </p>
      </header>

      <div className="mt-8 w-full min-w-0 border-b border-border/70 bg-background/95 pt-2 pb-6 backdrop-blur-md md:sticky md:top-14 md:z-30">
        <TvDiscoverFilters
          genres={genres}
          state={browseState}
          className={`rounded-none border-x-0 shadow-none ${pagePad}`}
        />
      </div>

      {data.results.length === 0 ? (
        <div
          className={`mt-10 w-full rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center ${pagePad}`}
        >
          <p className="text-lg font-medium text-foreground">No series match these filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a lower minimum rating, fewer genres, or set first air year and rating back to
            “Any”.
          </p>
        </div>
      ) : (
        <div className={`mt-10 ${pagePad}`}>
          <TvDiscoverInfinite
            key={discoverKey || 'default'}
            initial={data}
            filters={filters}
            genreMap={genreMap}
            watchlistedKeys={watchlistedKeys}
          />
        </div>
      )}
    </div>
  );
}
