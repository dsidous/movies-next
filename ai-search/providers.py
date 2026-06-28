import json
import re

from litellm import completion

from config import Settings

SYSTEM_PROMPT = """You help users find movies, TV shows, and people on TMDB (The Movie Database).

Given a natural-language search query, return a JSON array of up to 5 specific titles or names to search on TMDB.

Rules:
- Return only real, searchable movie titles, TV show names, or person names
- Prefer well-known titles that match the user's intent
- For actor/director filmography queries (e.g. "Tom Hanks movies", "Nolan films"), return ONLY the person's name — never expand into individual titles
- For vague descriptions, infer the most likely match (e.g. "Leo dream movie" → "Inception")
- For genre/era queries, list representative titles (e.g. "80s sci-fi" → ["Back to the Future", "Blade Runner"])
- Do not include explanations, markdown, or extra fields
- Output must be valid JSON: a string array only

Example input: "that movie where they go inside dreams"
Example output: ["Inception"]

Example input: "tom hanks movies"
Example output: ["Tom Hanks"]"""

SUPPORTED_PROVIDERS = frozenset({"groq", "openai", "anthropic", "google"})


def _resolve_model(settings: Settings) -> str:
    provider = settings.ai_provider.strip().lower()
    model = settings.ai_model.strip()

    if "/" in model:
        return model

    if provider == "groq":
        return f"groq/{model}"
    if provider == "anthropic":
        return f"anthropic/{model}"
    if provider == "google":
        return f"gemini/{model}"
    return model


def _parse_search_terms(content: str) -> list[str]:
    text = content.strip()
    if not text:
        return []

    # Strip markdown code fences if present
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if fenced:
        text = fenced.group(1).strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return []

    if not isinstance(parsed, list):
        return []

    terms: list[str] = []
    for item in parsed:
        if isinstance(item, str):
            term = item.strip()
            if term and term not in terms:
                terms.append(term)
        if len(terms) >= 5:
            break
    return terms


def interpret_query(query: str, settings: Settings) -> list[str]:
    provider = settings.ai_provider.strip().lower()
    if provider not in SUPPORTED_PROVIDERS:
        raise ValueError(
            f"Unsupported AI_PROVIDER: {settings.ai_provider}. "
            f"Use one of: {', '.join(sorted(SUPPORTED_PROVIDERS))}."
        )
    if not settings.ai_api_key:
        raise ValueError("AI_API_KEY is required")

    model = _resolve_model(settings)

    response = completion(
        model=model,
        api_key=settings.ai_api_key,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query.strip()},
        ],
        temperature=0.2,
        max_tokens=256,
    )

    content = response.choices[0].message.content
    if not content:
        return []
    return _parse_search_terms(content)
