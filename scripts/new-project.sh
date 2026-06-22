#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${1:?usage: new-project.sh <domain.tld>}"
TEMPLATE_DIR="$ROOT_DIR/proyectos/example.tld"
TARGET_DIR="$ROOT_DIR/proyectos/$DOMAIN"

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "Missing template project: $TEMPLATE_DIR" >&2
  exit 1
fi

if [[ -e "$TARGET_DIR" ]]; then
  echo "Target already exists: $TARGET_DIR" >&2
  exit 1
fi

cp -R "$TEMPLATE_DIR" "$TARGET_DIR"
TMP_FILE="$(mktemp)"
jq --arg domain "$DOMAIN" '
  .project.slug = $domain |
  .project.primary_domain = $domain
' "$TARGET_DIR/stack.json" > "$TMP_FILE"
mv "$TMP_FILE" "$TARGET_DIR/stack.json"

echo "Created $TARGET_DIR"
echo "Now edit $TARGET_DIR/stack.json and replace every PENDING_* value."
