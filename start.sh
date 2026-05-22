#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/quartz"

if [ ! -d node_modules ]; then
  npm ci
fi

npm run quartz -- build --serve --port "${PORT:-8080}"
