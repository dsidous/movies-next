export async function tmdbFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json() as T;
}
