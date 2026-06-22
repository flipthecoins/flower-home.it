#!/usr/bin/env bash
set -euo pipefail

STACK_FILE="${2:?usage: deploy-pages.sh <client|bot> <project-stack.json>}"
PROJECT_ROOT="$(cd "$(dirname "$STACK_FILE")" && pwd)"
TARGET="${1:?usage: deploy-pages.sh <client|bot> <project-stack.json>}"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID" >&2
  exit 1
fi

DIRECTORY="$(jq -r --arg target "$TARGET" '.pages[$target].directory' "$STACK_FILE")"
PROJECT_NAME="$(jq -r --arg target "$TARGET" '.pages[$target].pages_project' "$STACK_FILE")"
BRANCH_NAME="$(jq -r --arg target "$TARGET" '.pages[$target].production_branch' "$STACK_FILE")"

if [[ "$DIRECTORY" == "null" || "$PROJECT_NAME" == "null" || "$BRANCH_NAME" == "null" ]]; then
  echo "Invalid pages target: $TARGET" >&2
  exit 1
fi

echo "Deploying Pages target: $TARGET -> $PROJECT_NAME"
npx wrangler pages deploy "$PROJECT_ROOT/$DIRECTORY"   --project-name "$PROJECT_NAME"   --branch "$BRANCH_NAME"
