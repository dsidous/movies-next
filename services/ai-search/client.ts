export class AiSearchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AiSearchError';
  }
}

export async function aiSearchFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.AI_SEARCH_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    throw new AiSearchError('AI_SEARCH_BASE_URL is not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const serviceKey = process.env.AI_SEARCH_SERVICE_KEY;
  if (serviceKey) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new AiSearchError(
      detail || `AI Search service error: ${response.statusText}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
