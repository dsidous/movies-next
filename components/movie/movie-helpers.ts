/** Valid positive TMDB id from a route param string, or null if invalid. */
export function parseMovieIdParam(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export function formatRuntime(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return '';
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

export function buildYoutubeEmbedUrl(key: string) {
  return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
}

export function buildYoutubeWatchUrl(key: string) {
  return `https://www.youtube.com/watch?v=${key}`;
}

export function youtubeThumbUrl(key: string) {
  return `https://i.ytimg.com/vi/${key}/mqdefault.jpg`;
}

export type VideoListItemForUi = {
  key: string;
  name: string;
  type: string;
  thumbnailUrl: string;
};

/**
 * YouTube-style videos for `MovieVideosSection`, sorted: trailer, teaser, clip, featurette, then other.
 */
export function prepareVideosForUi(
  results: {
    site?: string | null;
    key?: string | null;
    name?: string | null;
    type?: string | null;
  }[],
): VideoListItemForUi[] {
  const yt = results.filter((v) => v.site === 'YouTube' && v.key);
  const weight = (t: string | undefined) => {
    const x = (t ?? '').toLowerCase();
    if (x === 'trailer') return 0;
    if (x === 'teaser') return 1;
    if (x === 'clip') return 2;
    if (x === 'featurette') return 3;
    return 4;
  };
  return [...yt]
    .sort((a, b) => weight(a.type ?? undefined) - weight(b.type ?? undefined))
    .map((v) => ({
      key: v.key!,
      name: v.name?.trim() || 'Video',
      type: v.type?.trim() || '',
      thumbnailUrl: youtubeThumbUrl(v.key!),
    }));
}
