import type { Metadata } from 'next';

import type { MoviesDiscoverFilters } from '@/lib/actions/discover';
import {
  moviesBrowseStateToDiscoverQuery,
  parseMoviesBrowseSearchParams,
  serializeMoviesBrowseSearchParams,
} from '@/lib/movies-discover-search-params';
import { discoverMovies, getMovieGenres } from '@services/tmdb';

import { MoviesDiscoverInfinite } from '@/components/movies/movies-discover-infinite';
import { MoviesFilters } from '@/components/movies/movies-filters';

export const metadata: Metadata = {
  title: 'Browse movies | Movie Search',
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

  const [genres, data] = await Promise.all([getMovieGenres(), discoverMovies(query)]);

  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  const discoverKey = serializeMoviesBrowseSearchParams({ ...browseState, page: 1 });

  return (
    <div className="w-full min-w-0 px-4 pt-6 pb-10 md:px-6 lg:px-10">
      <div className="sticky top-14 z-30 -mx-4 border-b border-border/70 bg-background/95 px-4 pt-2 pb-6 backdrop-blur-md md:-mx-6 md:px-6 lg:-mx-10 lg:px-10">
        <header className="w-full space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Movies</h1>
          <p className="text-muted-foreground">
            Explore releases with filters for sort order, genres, release year, and rating. Results
            come from TMDB&apos;s discover API and update when you change settings.
          </p>
        </header>

        <div className="mt-8 w-full">
          <MoviesFilters genres={genres} state={browseState} />
        </div>
      </div>

      {data.results.length === 0 ? (
        <div className="mt-10 w-full rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No movies match these filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a lower minimum rating, fewer genres, or set release year and rating back to “Any”.
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <MoviesDiscoverInfinite
            key={discoverKey || 'default'}
            initial={data}
            filters={filters}
            genreMap={genreMap}
          />
        </div>
      )}
    </div>
  );
}
