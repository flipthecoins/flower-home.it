#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mapfile -t stack_files < <(find "$ROOT_DIR/proyectos" -mindepth 2 -maxdepth 2 -name stack.json | sort)

if [[ "${#stack_files[@]}" -eq 0 ]]; then
  echo "No stack.json files found under proyectos/" >&2
  exit 1
fi

for stack_file in "${stack_files[@]}"; do
  project_dir="${stack_file%/stack.json}"
  project_dir="${project_dir#$ROOT_DIR/}"
  bash "$ROOT_DIR/scripts/deploy-project.sh" "$project_dir"
done
