#!/usr/bin/env bash
set -euo pipefail

STACK_FILE="${1:?usage: submit-indexer.sh <project-stack.json>}"

if [[ -z "${PRIMEINDEXER_API_KEY:-}" ]]; then
  echo "Skipping Prime Indexer: missing PRIMEINDEXER_API_KEY"
  exit 0
fi

# Only submit when the bot directory actually changed in this push.
# `BOT_CHANGED` is set by the deploy workflow (true/false). Default to true
# so local/manual runs still index unless explicitly disabled.
if [[ "${BOT_CHANGED:-true}" != "true" ]]; then
  echo "Skipping Prime Indexer: bot/ unchanged in this push"
  exit 0
fi

PROJECT_SLUG="$(jq -r '.project.slug' "$STACK_FILE")"
URLS_JSON="$(jq -c '((.public_domains.primary // []) + (.public_domains.legacy // [])) | unique' "$STACK_FILE")"
RUN_ID="${GITHUB_RUN_ID:-manual}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
NAME="${PROJECT_SLUG}-${TIMESTAMP}-${RUN_ID}"

DELAY_SECONDS="${PRIMEINDEXER_DELAY_SECONDS:-60}"
echo "Waiting ${DELAY_SECONDS} seconds before indexing ${PROJECT_SLUG}..."
sleep "$DELAY_SECONDS"

PAYLOAD="$(jq -nc \
  --arg name "$NAME" \
  --argjson urls "$URLS_JSON" \
  '{name: $name, urls: $urls, dripfeed: false}')"

curl -fsS -X POST "https://app.primeindexer.com/api/v1/projects" \
  -H "x-api-key: ${PRIMEINDEXER_API_KEY}" \
  -H "Content-Type: application/json" \
  --data "$PAYLOAD"

echo "Prime Indexer submission sent for ${PROJECT_SLUG}"
