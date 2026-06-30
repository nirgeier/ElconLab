#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${SCRIPT_DIR}/.mkdocs-shared/init_site.sh"

if [[ ! -x "${TARGET}" ]]; then
  echo "Error: ${TARGET} not found or not executable" >&2
  exit 1
fi

exec "${TARGET}" "$@"
