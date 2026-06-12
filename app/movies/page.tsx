import type { Metadata } from 'next';

import type { MoviesDiscoverFilters } from '@/lib/actions/discover';
import { SITE_NAME } from '@/lib/constants/site';
import {
  moviesBrowseStateToDiscoverQuery,
  parseMoviesBrowseSearchParams,
  serializeMoviesBrowseSearchParams,
} from '@/lib/movies-discover-search-params';
import { getWatchlistedKeys } from '@/lib/watchlisted-keys';
import { discoverMovies, getMovieGenres } from '@services/tmdb';

import { MoviesDiscoverInfinite } from '@/components/movies/movies-discover-infinite';
import { MoviesFilters } from '@/components/movies/movies-filters';

export const metadata: Metadata = {
  title: `Browse movies | ${SITE_NAME}`,
  description:
    'Discover movies from TMDB — sort by popularity, rating, or release date, filter by genre, year, and score.',
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MoviesPage({ searchParams }: PageProps) {
  const raw = (await searchParams) ?? {};
  const browseState = parseMoviesBrowseSearchParams(raw);
  const filters: MoviesDiscoverFilters = {
    sort: browseState.sort,
    genreIds: browseState.genreIds,
    year: browseState.year,
    voteGreaterThan: browseState.voteGreaterThan,
  };
  const query = moviesBrowseStateToDiscoverQuery({ ...filters, page: 1 });

  const [genres, data, watchlistedKeys] = await Promise.all([
    getMovieGenres(),
    discoverMovies(query),
    getWatchlistedKeys(),
  ]);

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  const discoverKey = serializeMoviesBrowseSearchParams({ ...browseState, page: 1 });

  /** Match `SiteHeader` inner row so title, filters, and grid share one column width. */
  const pagePad = 'px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12';

  return (
    <div className="w-full min-w-0 pt-6 pb-10">
      <header className={`w-full space-y-2 ${pagePad}`}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Movies</h1>
        <p className="text-muted-foreground">
          Explore releases with filters for sort order, genres, release year, and rating. Results
          come from TMDB&apos;s discover API and update when you change settings.
        </p>
      </header>

      <div className="mt-8 w-full min-w-0 border-b border-border/70 bg-background/95 pt-2 pb-6 backdrop-blur-md md:sticky md:top-14 md:z-30">
        <MoviesFilters
          genres={genres}
          state={browseState}
          className={`rounded-none border-x-0 shadow-none ${pagePad}`}
        />
      </div>

      {data.results.length === 0 ? (
        <div
          className={`mt-10 w-full rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center ${pagePad}`}
        >
          <p className="text-lg font-medium text-foreground">No movies match these filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a lower minimum rating, fewer genres, or set release year and rating back to “Any”.
          </p>
        </div>
      ) : (
        <div className={`mt-10 ${pagePad}`}>
          <MoviesDiscoverInfinite
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
