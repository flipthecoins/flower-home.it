#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_FILE="${1:?usage: sync-secrets.sh <project-stack.json>}"

if [[ -z "${WORKER_SECRET_VALUES_JSON:-}" ]]; then
  echo "WORKER_SECRET_VALUES_JSON is empty, skipping Worker secret sync"
  exit 0
fi

while IFS= read -r worker_id; do
  [[ -z "$worker_id" ]] && continue

  secret_count="$(jq -r --arg worker_id "$worker_id" '
    if has($worker_id) then .[$worker_id] | keys | length else 0 end
  ' <<<"$WORKER_SECRET_VALUES_JSON")"

  if [[ "$secret_count" == "0" ]]; then
    continue
  fi

  echo "Syncing Worker secrets: $worker_id"
  CONFIG_FILE="$(mktemp --suffix=.jsonc)"
  bash "$ROOT_DIR/scripts/render-worker-config.sh" "$worker_id" "$STACK_FILE" > "$CONFIG_FILE"

  while IFS= read -r secret_name; do
    [[ -z "$secret_name" ]] && continue

    secret_value="$(jq -r --arg worker_id "$worker_id" --arg secret_name "$secret_name" '
      .[$worker_id][$secret_name]
    ' <<<"$WORKER_SECRET_VALUES_JSON")"

    printf '%s' "$secret_value" | npx wrangler secret put "$secret_name" --config "$CONFIG_FILE"
  done < <(jq -r --arg worker_id "$worker_id" '
    if has($worker_id) then .[$worker_id] | keys[] else empty end
  ' <<<"$WORKER_SECRET_VALUES_JSON")

  rm -f "$CONFIG_FILE"
done < <(jq -r '.workers[].id' "$STACK_FILE")
