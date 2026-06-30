#!/usr/bin/env bash
#
# build.sh - rebuild the Claude Code slide deck from the markdown notes.
#
# Run this after editing any file in slides/. It:
#   1. Merges slides/NN-*.md into combined.md (dark theme + auto-split long slides)
#   2. Exports the deck to PDF, PPTX (editable text), and HTML
#
# Usage:
#   ./build.sh                 # build pdf, pptx, html
#   ./build.sh pdf             # build only the given format(s)
#   ./build.sh pdf html
#   ./build.sh pptx-image      # Marp image-based PPTX (pixel-perfect, not editable)
#
# Formats:
#   pdf         PDF (present anywhere)
#   pptx        EDITABLE-text PowerPoint via pptxgenjs (PowerPoint/Google Slides/Keynote)
#   html        self-contained HTML (arrow-key navigation)
#   pptx-image  image-per-slide PPTX via Marp (matches theme exactly, but text not editable)
#
# Requires: Node.js. Marp is fetched on demand via npx; pptxgenjs is installed
# locally into node_modules on first PPTX build.

set -euo pipefail

# Always run from the directory this script lives in.
cd "$(dirname "$0")"

MARP="npx -y @marp-team/marp-cli@latest"
SRC="combined.md"
OUT="claude-code-deck"

# Formats: use args if given, otherwise build everything.
if [ "$#" -gt 0 ]; then
  FORMATS=("$@")
else
  FORMATS=(pdf pptx html)
fi

echo "==> Merging slides/ -> $SRC"
node build-combined.mjs

for fmt in "${FORMATS[@]}"; do
  case "$fmt" in
    pdf)
      echo "==> Exporting PDF  -> ${OUT}.pdf"
      $MARP "$SRC" --pdf  --allow-local-files -o "${OUT}.pdf"
      ;;
    pptx)
      # Editable-text PPTX via pptxgenjs (NOT Marp's image-per-slide export),
      # so the slides can be edited in PowerPoint / Google Slides / Keynote.
      echo "==> Exporting PPTX -> ${OUT}.pptx (editable text)"
      if [ ! -d node_modules/pptxgenjs ]; then
        echo "    installing pptxgenjs (first run only)..."
        npm install pptxgenjs >/dev/null 2>&1
      fi
      node build-pptx.mjs "${OUT}.pptx"
      ;;
    pptx-image)
      # Fallback: Marp's image-based PPTX (pixel-perfect theme, but not editable).
      echo "==> Exporting PPTX -> ${OUT}-image.pptx (image-based, Marp)"
      $MARP "$SRC" --pptx --allow-local-files -o "${OUT}-image.pptx"
      ;;
    html)
      echo "==> Exporting HTML -> ${OUT}.html"
      $MARP "$SRC" --html --allow-local-files -o "${OUT}.html"
      ;;
    *)
      echo "!! Unknown format: '$fmt' (expected: pdf, pptx, html)" >&2
      exit 1
      ;;
  esac
done

echo "==> Done. Built: ${FORMATS[*]}"
