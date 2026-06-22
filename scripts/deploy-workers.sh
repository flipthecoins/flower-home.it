#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_FILE="${1:?usage: deploy-workers.sh <project-stack.json>}"

while IFS= read -r worker_id; do
  [[ -z "$worker_id" ]] && continue

  echo "Deploying Worker: $worker_id"
  CONFIG_FILE="$(mktemp --suffix=.jsonc)"
  bash "$ROOT_DIR/scripts/render-worker-config.sh" "$worker_id" "$STACK_FILE" > "$CONFIG_FILE"
  npx wrangler deploy --config "$CONFIG_FILE"
  rm -f "$CONFIG_FILE"
done < <(jq -r '.workers[].id' "$STACK_FILE")
