#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")" && pwd)"

cd "$repo_root"
node scripts/generate-site.mjs

cd "$repo_root/quartz"

if [ ! -d node_modules ]; then
  npm ci
fi

npm run quartz -- build --serve --port "${PORT:-8080}"
