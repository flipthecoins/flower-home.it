#!/usr/bin/env bash
set -euo pipefail

STACK_FILE="${1:?usage: validate-stack.sh <project-stack.json>}"
PROJECT_ROOT="$(cd "$(dirname "$STACK_FILE")" && pwd)"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

# pages.client is optional; pages.bot is required
jq -e '
  .project.slug
  and .project.primary_domain
  and .pages.bot.directory
  and .pages.bot.pages_project
  and (.workers | length > 0)
' "$STACK_FILE" >/dev/null

# Check bot directory always exists
bot_dir="$(jq -r '.pages.bot.directory' "$STACK_FILE")"
if [[ ! -d "$PROJECT_ROOT/$bot_dir" ]]; then
  echo "Missing directory: $bot_dir" >&2
  exit 1
fi

# Check client directory only if declared
client_dir="$(jq -r '.pages.client.directory // empty' "$STACK_FILE")"
if [[ -n "$client_dir" && ! -d "$PROJECT_ROOT/$client_dir" ]]; then
  echo "Missing directory: $client_dir" >&2
  exit 1
fi

while IFS= read -r worker_directory; do
  [[ -z "$worker_directory" ]] && continue
  if [[ ! -d "$PROJECT_ROOT/$worker_directory" ]]; then
    echo "Missing worker directory: $worker_directory" >&2
    exit 1
  fi
done < <(jq -r '.workers[].directory' "$STACK_FILE")

while IFS=$'\t' read -r worker_directory worker_entry; do
  [[ -z "$worker_directory" || -z "$worker_entry" ]] && continue
  if [[ ! -f "$PROJECT_ROOT/$worker_directory/$worker_entry" ]]; then
    echo "Missing worker entry: $worker_directory/$worker_entry" >&2
    exit 1
  fi
done < <(jq -r '.workers[] | [.directory, .entry] | @tsv' "$STACK_FILE")

if jq -e '.. | strings | select(startswith("PENDING_"))' "$STACK_FILE" >/dev/null; then
  echo "stack.json still contains PENDING_* placeholders" >&2
  exit 1
fi

echo "stack.json validated"
