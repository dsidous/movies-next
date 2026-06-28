import { getConfiguration } from '../configuration/api';
import { getMovieGenres, getTvGenres } from '../genre/api';
import {
  getPersonCombinedCredits,
  getPersonMovieCredits,
  getPersonTvCredits,
} from '../person/api';
import { formatImageUrlWithBase } from '../utils';
import { searchMulti } from './api';
import type { SearchMultiResult } from './schema';

type PersonMediaFilter = 'movie' | 'tv' | 'all';

type CreditCastRow = {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
};

const MAX_PERSON_MEDIA_RESULTS = 40;

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function pickBestPersonMatch(
  results: SearchMultiResult[],
  personName: string,
): SearchMultiResult | null {
  const people = results.filter((r) => r.media_type === 'person' && r.name);
  if (people.length === 0) return null;

  const target = normalizeName(personName);
  const exact = people.find((p) => normalizeName(p.name!) === target);
  if (exact) return exact;

  const startsWith = people.find((p) => normalizeName(p.name!).startsWith(target));
  if (startsWith) return startsWith;

  const includes = people.find((p) => normalizeName(p.name!).includes(target));
  if (includes) return includes;

  return people[0] ?? null;
}

function parseCreditCast(
  cast: unknown[],
  mediaFilter: PersonMediaFilter,
  defaultMediaType?: 'movie' | 'tv',
): CreditCastRow[] {
  const rows: CreditCastRow[] = [];
  for (const raw of cast) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const id = row.id;
    const media =
      row.media_type === 'movie' || row.media_type === 'tv'
        ? row.media_type
        : defaultMediaType;
    if (typeof id !== 'number' || !media) continue;
    if (mediaFilter !== 'all' && media !== mediaFilter) continue;

    rows.push({
      id,
      media_type: media,
      title: typeof row.title === 'string' ? row.title : undefined,
      name: typeof row.name === 'string' ? row.name : undefined,
      release_date: typeof row.release_date === 'string' ? row.release_date : undefined,
      first_air_date: typeof row.first_air_date === 'string' ? row.first_air_date : undefined,
      poster_path:
        typeof row.poster_path === 'string'
          ? row.poster_path
          : row.poster_path === null
            ? null
            : undefined,
      vote_average: typeof row.vote_average === 'number' ? row.vote_average : undefined,
      vote_count: typeof row.vote_count === 'number' ? row.vote_count : undefined,
      genre_ids: Array.isArray(row.genre_ids)
        ? row.genre_ids.filter((g): g is number => typeof g === 'number')
        : undefined,
    });
  }
  return rows;
}

function genreLabels(ids: number[] | undefined, genreMap: Map<number, string>): string[] {
  if (!ids?.length) return [];
  return ids.map((id) => genreMap.get(id)).filter((x): x is string => Boolean(x));
}

function creditYear(row: CreditCastRow): string {
  const raw =
    typeof row.release_date === 'string' && row.release_date
      ? row.release_date
      : typeof row.first_air_date === 'string' && row.first_air_date
        ? row.first_air_date
        : '';
  return raw ? (raw.split('-')[0] ?? '') : '';
}

function creditToSearchResult(
  row: CreditCastRow,
  imageBaseUrl: string,
  movieGenreMap: Map<number, string>,
  tvGenreMap: Map<number, string>,
): SearchMultiResult {
  const genreMap = row.media_type === 'tv' ? tvGenreMap : movieGenreMap;
  const year = creditYear(row);

  if (row.media_type === 'tv') {
    return {
      id: row.id,
      media_type: 'tv',
      name: row.name,
      posterUrl: formatImageUrlWithBase(row.poster_path ?? null, imageBaseUrl, 'w500'),
      firstAirYear: year,
      voteAverage: row.vote_average,
      voteCount: row.vote_count,
      genres: genreLabels(row.genre_ids, genreMap),
    };
  }

  return {
    id: row.id,
    media_type: 'movie',
    title: row.title,
    posterUrl: formatImageUrlWithBase(row.poster_path ?? null, imageBaseUrl, 'w500'),
    releaseYear: year,
    voteAverage: row.vote_average,
    voteCount: row.vote_count,
    genres: genreLabels(row.genre_ids, genreMap),
  };
}

async function fetchPersonCredits(personId: number, mediaFilter: PersonMediaFilter) {
  if (mediaFilter === 'movie') {
    const data = await getPersonMovieCredits(personId);
    return parseCreditCast(data.cast, 'movie', 'movie');
  }
  if (mediaFilter === 'tv') {
    const data = await getPersonTvCredits(personId);
    return parseCreditCast(data.cast, 'tv', 'tv');
  }
  const data = await getPersonCombinedCredits(personId);
  return parseCreditCast(data.cast, 'all');
}

export async function searchPersonMediaResults(
  personName: string,
  mediaFilter: PersonMediaFilter,
): Promise<SearchMultiResult[]> {
  const personSearch = await searchMulti({ query: personName });
  const person = pickBestPersonMatch(personSearch.results, personName);
  if (!person) return [];

  const [{ images }, movieGenres, tvGenres, credits] = await Promise.all([
    getConfiguration(),
    getMovieGenres(),
    getTvGenres(),
    fetchPersonCredits(person.id, mediaFilter),
  ]);

  const movieGenreMap = new Map(movieGenres.map((g) => [g.id, g.name]));
  const tvGenreMap = new Map(tvGenres.map((g) => [g.id, g.name]));

  const seen = new Set<string>();
  const rows: SearchMultiResult[] = [];

  const sortedCredits = [...credits].sort((a, b) => {
    const votesA = a.vote_count ?? 0;
    const votesB = b.vote_count ?? 0;
    if (votesB !== votesA) return votesB - votesA;
    const yearA = creditYear(a) ? parseInt(creditYear(a), 10) : 0;
    const yearB = creditYear(b) ? parseInt(creditYear(b), 10) : 0;
    return yearB - yearA;
  });

  for (const credit of sortedCredits) {
    const key = `${credit.media_type}-${credit.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(creditToSearchResult(credit, images.imageBaseUrl, movieGenreMap, tvGenreMap));
    if (rows.length >= MAX_PERSON_MEDIA_RESULTS) break;
  }

  return rows;
}
