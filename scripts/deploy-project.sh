#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="${1:?usage: deploy-project.sh <project-dir>}"
STACK_FILE="$ROOT_DIR/$PROJECT_DIR/stack.json"

bash "$ROOT_DIR/scripts/validate-stack.sh" "$STACK_FILE"

# Deploy client only if declared in stack.json
if jq -e '.pages.client' "$STACK_FILE" > /dev/null 2>&1; then
  bash "$ROOT_DIR/scripts/deploy-pages.sh" client "$STACK_FILE"
fi

bash "$ROOT_DIR/scripts/deploy-pages.sh" bot "$STACK_FILE"
bash "$ROOT_DIR/scripts/deploy-workers.sh" "$STACK_FILE"
bash "$ROOT_DIR/scripts/sync-secrets.sh" "$STACK_FILE"
bash "$ROOT_DIR/scripts/submit-indexer.sh" "$STACK_FILE"
