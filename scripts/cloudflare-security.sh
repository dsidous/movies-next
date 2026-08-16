#!/usr/bin/env bash
# Applies Cloudflare security settings via the API so they are version-controlled:
#   - Bot Fight Mode (Free plan) + Block AI Scrapers
#   - Rate limiting ruleset (general + /api/*)
#
# Required env:
#   CLOUDFLARE_API_TOKEN  - API token with Zone WAF Edit + Zone Settings Edit permissions
#   SST_SITE_DOMAIN       - the site hostname, e.g. watch.example.com
#   CLOUDFLARE_ZONE_ID    - (optional) zone id; resolved from SST_SITE_DOMAIN if unset
#
# Usage: bash scripts/cloudflare-security.sh
set -euo pipefail

API="https://api.cloudflare.com/client/v4"
DOMAIN="${SST_SITE_DOMAIN:?SST_SITE_DOMAIN is required}"

if [[ -z "${CLOUDFLARE_ZONE_ID:-}" ]]; then
  echo "Resolving zone id for $DOMAIN..."
  resp=$(curl -fsS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "$API/zones?name=$DOMAIN")
  CLOUDFLARE_ZONE_ID=$(printf '%s' "$resp" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["result"][0]["id"])')
fi
echo "Zone id: $CLOUDFLARE_ZONE_ID"

# 1. Bot Fight Mode + Block AI Scrapers
echo "Enabling Bot Fight Mode + Block AI Scrapers..."
curl -fsS -X PUT \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"fight_mode":true,"ai_bots_protection":"block"}' \
  "$API/zones/$CLOUDFLARE_ZONE_ID/bot_management" >/dev/null

# 2. Rate limiting ruleset (replaces the entry point ruleset so the config is deterministic)
echo "Applying rate limiting rules..."
curl -fsS -X PUT \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data @- \
  "$API/zones/$CLOUDFLARE_ZONE_ID/rulesets/phases/http_ratelimit/entrypoint" <<'JSON'
{
  "rules": [
    {
      "expression": "(http.request.uri.path matches \"^/api/\")",
      "description": "Limit /api/* traffic per client",
      "action": "block",
      "ratelimit": {
        "characteristics": ["ip.src"],
        "period": 60,
        "requests_per_period": 20,
        "mitigation_timeout": 300
      }
    },
    {
      "expression": "true",
      "description": "General rate limit for the site",
      "action": "block",
      "ratelimit": {
        "characteristics": ["ip.src"],
        "period": 60,
        "requests_per_period": 120,
        "mitigation_timeout": 300
      }
    }
  ]
}
JSON

echo "Cloudflare security settings applied."