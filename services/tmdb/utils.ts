import { getConfiguration } from "./configuration/api";

export function tmdbPath(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!query) return path;
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    p.set(key, String(value));
  }
  const qs = p.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Sub-resources to merge on a single TMDB **detail** request, mapped to `append_to_response`.
 * Use the same token names as the API (e.g. `videos`, `images`, `credits`).
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export type DetailIncludeQuery = {
  include?: string | string[];
};

/**
 * Turn `include` into a comma-separated `append_to_response` value (trim, dedupe).
 */
export function includeToAppendToResponseValue(
  include?: string | string[],
): string | undefined {
  if (include == null) return undefined;
  const parts = (
    Array.isArray(include) ? include : include.split(",")
  )
    .flatMap((s) => s.split(","))
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = [...new Set(parts)];
  return unique.length ? unique.join(",") : undefined;
}

type QueryValue = string | number | boolean | null | undefined;

/**
 * Query for {@link tmdbPathWithInclude}: same keys as {@link tmdbPath} plus `include`
 * (only `include` may use `string[]`; it is not sent on the wire).
 */
export type TmdbPathWithIncludeQuery = {
  include?: string | string[];
} & Record<string, QueryValue | string | string[] | undefined>;

/**
 * Like {@link tmdbPath}, but takes `include` and sends it as `append_to_response` (does not pass `include` to the network).
 */
export function tmdbPathWithInclude(
  path: string,
  query?: TmdbPathWithIncludeQuery | undefined,
) {
  if (!query) return path;
  const { include, ...rest } = query;
  const merged: Record<string, QueryValue> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) continue;
    merged[key] = value;
  }
  const atr = includeToAppendToResponseValue(include);
  if (atr) merged.append_to_response = atr;
  return tmdbPath(path, merged);
}

/**
 * Build an image URL using TMDB path + size segment. Use when you already have
 * `configuration.images.imageBaseUrl` to avoid an extra /configuration call.
 */
export function formatImageUrlWithBase(
  path: string | null,
  imageBaseUrl: string,
  size: 'w500' | 'original' | 'w185' | 'w92' = 'w500',
) {
  if (!path) return '/placeholder-poster.png'; // TODO: Add a placeholder image
  return `${imageBaseUrl}${size}${path}`;
}

export const formatImageUrl = async (
  path: string | null,
  size: 'w500' | 'original' | 'w185' | 'w92' = 'w500',
) => {
  const configuration = await getConfiguration();
  return formatImageUrlWithBase(path, configuration.images.imageBaseUrl, size);
};