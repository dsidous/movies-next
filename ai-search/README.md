# AI Search Microservice

FastAPI service that interprets natural-language queries via a configurable LLM provider and returns TMDB-searchable titles.

This service is **not** deployed with the Next.js app. Run it locally for development; production deploys to **[Modal](https://modal.com/)** via GitHub Actions.

## Local development

### Setup

```bash
cd ai-search
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Or from the repo root:

```bash
bun run ai-search:setup
```

Create `ai-search/.env`:

```bash
AI_PROVIDER=groq
AI_MODEL=qwen/qwen3.6-27b
AI_API_KEY=your-provider-api-key

# Optional shared secret (must match Next.js AI_SEARCH_SERVICE_KEY)
# AI_SEARCH_SERVICE_KEY=your-secret
```

### Run

```bash
uvicorn main:app --reload --port 8000
```

Or from the repo root: `bun run ai-search:dev`

Health check: `GET http://localhost:8000/health`

## Production (Modal)

Deploys automatically on push to `main` when `ai-search/**` changes (see [`.github/workflows/deploy-ai-search.yml`](../.github/workflows/deploy-ai-search.yml)).

### One-time setup

1. Create a [Modal](https://modal.com/) account and [API token](https://modal.com/settings/tokens).
2. Add GitHub Actions secrets: `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET`.
3. Create a Modal secret named **`ai-search-secrets`** with:
   - `AI_PROVIDER`
   - `AI_MODEL`
   - `AI_API_KEY`
   - `AI_SEARCH_SERVICE_KEY` (optional)
4. After the first deploy, copy the Modal web URL from the dashboard.
5. Set GitHub secret **`AI_SEARCH_BASE_URL`** to that URL and redeploy Next.js.

Manual deploy from `ai-search/`:

```bash
pip install "modal>=1.0,<2"
modal deploy modal_app.py
```

## API

`POST /interpret`

```json
{ "query": "that movie where Leo goes into dreams" }
```

Response:

```json
{ "search_terms": ["Inception"] }
```

If `AI_SEARCH_SERVICE_KEY` is set, send `Authorization: Bearer <key>`.

## Environment variables

| Variable                | Required | Description                                                                                                                        |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `AI_PROVIDER`           | No       | `groq` (default), `openai`, `anthropic`, or `google`                                                                               |
| `AI_MODEL`              | No       | Model name for the chosen provider. Default `qwen/qwen3.6-27b` for Groq (Groq decommissioned `llama-3.3-70b-versatile` on 2026-08-16). |
| `AI_API_KEY`            | Yes      | API key for the chosen provider (provider-agnostic name)                                                                           |
| `AI_SEARCH_SERVICE_KEY` | No       | Bearer token for service-to-service auth                                                                                           |
| `PORT`                  | No       | Default `8000` (local only; Modal serves ASGI directly)                                                                            |

### Example provider configs

**Groq** (default):

```bash
AI_PROVIDER=groq
AI_MODEL=qwen/qwen3.6-27b
AI_API_KEY=gsk_...
```

**OpenAI:**

```bash
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_API_KEY=sk-...
```

LLM API keys stay on this service only — never pass them to Next.js.
