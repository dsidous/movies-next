'use server';

import { parsePersonMediaQuery } from '@/lib/search-person-query';
import {
  filterResultsForSearchTerm,
  wasAiExpanded,
} from '@/lib/search-relevance';
import { interpretSearchQuery } from '@services/ai-search';
import { searchMulti, searchPersonMediaResults } from '@services/tmdb';
import type { SearchMultiResult } from '@services/tmdb';

type SearchData = Awaited<ReturnType<typeof searchMulti>>;

const MAX_SEARCH_TERMS = 5;

async function resolveSearchTerms(query: string): Promise<string[]> {
  if (!process.env.AI_SEARCH_BASE_URL?.trim()) {
    return [query];
  }

  try {
    const { search_terms } = await interpretSearchQuery(query);
    const terms = search_terms
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, MAX_SEARCH_TERMS);
    return terms.length > 0 ? terms : [query];
  } catch {
    return [query];
  }
}

function dedupeResults(results: SearchMultiResult[]): SearchMultiResult[] {
  const seen = new Set<string>();
  const deduped: SearchMultiResult[] = [];
  for (const result of results) {
    const key = `${result.media_type}-${result.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }
  return deduped;
}

export async function searchMultiAction(query: string, page: number = 1) {
  const q = query.trim();
  if (!q) {
    const data: SearchData = { page: 1, results: [], total_pages: 0, total_results: 0 };
    return { ok: true as const, data };
  }
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  try {
    const personQuery = parsePersonMediaQuery(q);
    if (personQuery) {
      const results = await searchPersonMediaResults(
        personQuery.personName,
        personQuery.mediaFilter,
      );
      const data: SearchData = {
        page: safePage,
        results,
        total_pages: 1,
        total_results: results.length,
      };
      return { ok: true as const, data };
    }

    const terms = await resolveSearchTerms(q);
    const aiExpanded = wasAiExpanded(q, terms);
    const searches = await Promise.all(
      terms.map((term) => searchMulti({ query: term, page: safePage })),
    );
    const merged = searches.flatMap((search, index) => {
      const term = terms[index]!;
      const results = search.results;
      return aiExpanded ? filterResultsForSearchTerm(results, term) : results;
    });
    const results = dedupeResults(merged);
    const data: SearchData = {
      page: safePage,
      results,
      total_pages: 1,
      total_results: results.length,
    };
    return { ok: true as const, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Search failed';
    return { ok: false as const, error: message };
  }
}
