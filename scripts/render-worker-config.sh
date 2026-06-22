#!/usr/bin/env bash
set -euo pipefail

STACK_FILE="${2:?usage: render-worker-config.sh <worker-id> <project-stack.json>}"
PROJECT_ROOT="$(cd "$(dirname "$STACK_FILE")" && pwd)"
WORKER_ID="${1:?usage: render-worker-config.sh <worker-id> <project-stack.json>}"

jq -c --arg worker_id "$WORKER_ID" --arg project_root "$PROJECT_ROOT" '
  .workers[]
  | select(.id == $worker_id)
  | {
      name: .name,
      main: ($project_root + "/" + .directory + "/" + .entry),
      compatibility_date: .compatibility_date,
      routes: .routes,
      vars: (
        (.vars // {}) +
        (if (.seo // null) != null then {
          CANONICAL_ORIGIN: .seo.canonical_origin,
          XDEFAULT_ORIGIN: (.seo.xdefault_origin // .seo.canonical_origin),
          HREFLANG_TAGS: ((.seo.hreflang_tags // []) | tojson)
        } else {} end)
      ),
      kv_namespaces: (.kv_namespaces // [])
    }
' "$STACK_FILE"
