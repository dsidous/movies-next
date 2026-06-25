#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -x .venv/bin/python ]]; then
  echo "Python venv not found. Run: bun run ai-search:setup" >&2
  exit 1
fi

exec .venv/bin/python -m uvicorn main:app --reload --port 8000
