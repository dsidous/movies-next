export async function tmdbFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${process.env.TMDB_BASE_URL}${endpoint}`; // no NEXT_PUBLIC_

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`, // no NEXT_PUBLIC_
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: {
      revalidate: 60 * 60 * 24, // still useful for RSC page renders
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json() as T;
}
