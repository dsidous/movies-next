/** Matches watchlist row identity: `media_type` + `media_id` as stored in DB. */
export function watchlistLookupKey(mediaType: 'movie' | 'tv', id: number) {
  return `${mediaType}:${id}`;
}
