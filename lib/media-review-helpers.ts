import { formatImageUrlWithBase } from '@services/tmdb/utils';

export const PREVIEW_INITIAL = 1;

export function resolveReviewAvatarUrl(
  avatarPath: string | null | undefined,
  imageBaseUrl: string,
): string | null {
  if (!avatarPath?.trim()) return null;

  let path = avatarPath.trim();
  if (path.startsWith('/') && path.includes('://')) {
    path = path.slice(1);
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return formatImageUrlWithBase(path, imageBaseUrl, 'w185');
}

export function formatReviewDate(iso: string | null | undefined) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  // Fixed locale so SSR and client hydration produce identical strings.
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(t);
}

export function reviewAuthorName(
  author: string | null | undefined,
  authorDetailsName: string | null | undefined,
) {
  const name = authorDetailsName?.trim() || author?.trim();
  return name || 'Anonymous';
}

export function reviewAuthorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}
