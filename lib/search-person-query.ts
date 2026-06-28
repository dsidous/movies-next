export type PersonMediaFilter = 'movie' | 'tv' | 'all';

export type PersonMediaQuery = {
  personName: string;
  mediaFilter: PersonMediaFilter;
};

const MOVIES_SUFFIX = /^(.+?)\s+(?:movies|films|filmography)$/i;
const TV_SUFFIX =
  /^(.+?)\s+(?:tv(?:\s+(?:shows?|series))?|television(?:\s+shows?)?|shows?|series)$/i;
const MOVIES_PREFIX = /^(?:movies|films)\s+(?:with|starring|by|from)\s+(.+)$/i;
const TV_PREFIX =
  /^(?:tv(?:\s+(?:shows?|series))?|shows?|series)\s+(?:with|starring|by|from)\s+(.+)$/i;
const QUALIFIED_MOVIES =
  /^(?:best|top|popular|favorite|favourite)\s+(.+?)\s+(?:movies|films)$/i;
const QUALIFIED_TV =
  /^(?:best|top|popular|favorite|favourite)\s+(.+?)\s+(?:tv(?:\s+(?:shows?|series))?|shows?|series)$/i;

function normalizePersonName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function personMediaQuery(
  personName: string,
  mediaFilter: PersonMediaFilter,
): PersonMediaQuery | null {
  const normalized = normalizePersonName(personName);
  if (normalized.length < 2) return null;
  return { personName: normalized, mediaFilter };
}

export function parsePersonMediaQuery(query: string): PersonMediaQuery | null {
  const q = query.trim();
  if (!q) return null;

  const patterns: Array<[RegExp, PersonMediaFilter]> = [
    [QUALIFIED_MOVIES, 'movie'],
    [QUALIFIED_TV, 'tv'],
    [MOVIES_SUFFIX, 'movie'],
    [TV_SUFFIX, 'tv'],
    [MOVIES_PREFIX, 'movie'],
    [TV_PREFIX, 'tv'],
  ];

  for (const [pattern, mediaFilter] of patterns) {
    const match = q.match(pattern);
    if (match?.[1]) {
      return personMediaQuery(match[1], mediaFilter);
    }
  }

  return null;
}
