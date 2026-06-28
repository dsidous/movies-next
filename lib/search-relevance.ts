import type { SearchMultiResult } from '@services/tmdb';

function normalizeTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

function resultTitle(result: SearchMultiResult): string {
  if (result.media_type === 'movie' && result.title) return result.title;
  if (result.name) return result.name;
  if (result.title) return result.title;
  return '';
}

export function titleMatchesSearchTerm(result: SearchMultiResult, term: string): boolean {
  const title = normalizeTitle(resultTitle(result));
  const query = normalizeTitle(term);
  if (!title || !query) return false;
  return title === query;
}

export function filterResultsForSearchTerm(
  results: SearchMultiResult[],
  term: string,
): SearchMultiResult[] {
  const people = results.filter((result) => result.media_type === 'person');
  const media = results.filter(
    (result) => result.media_type === 'movie' || result.media_type === 'tv',
  );
  const matchedMedia = media.filter((result) => titleMatchesSearchTerm(result, term));
  return [...matchedMedia, ...people];
}

export function wasAiExpanded(originalQuery: string, terms: string[]): boolean {
  if (terms.length > 1) return true;
  const original = normalizeTitle(originalQuery);
  return terms.some((term) => normalizeTitle(term) !== original);
}
