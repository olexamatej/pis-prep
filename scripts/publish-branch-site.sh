#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
quartz_dir="$repo_root/quartz"
published_paths=(
  404.html
  analysis
  assets
  favicon.ico
  index.css
  index.html
  index.xml
  must-know
  postscript.js
  prescript.js
  sitemap.xml
  sources
  static
  tags
  topics
)

if [[ -z "${GITHUB_REPOSITORY:-}" ]]; then
  origin_url="$(git -C "$repo_root" config --get remote.origin.url || true)"
  case "$origin_url" in
    git@github.com:*)
      repo_slug="${origin_url#git@github.com:}"
      repo_slug="${repo_slug%.git}"
      ;;
    https://github.com/*)
      repo_slug="${origin_url#https://github.com/}"
      repo_slug="${repo_slug%.git}"
      ;;
    *)
      repo_slug=""
      ;;
  esac

  if [[ -n "$repo_slug" ]]; then
    export GITHUB_REPOSITORY="$repo_slug"
  fi
fi

cd "$repo_root"
node scripts/generate-site.mjs

cd "$quartz_dir"

if [[ ! -d node_modules ]]; then
  npm ci
fi

npm run quartz -- build

for rel_path in "${published_paths[@]}"; do
  rm -rf "$repo_root/$rel_path"
done

cp -a "$quartz_dir/public/." "$repo_root/"
: > "$repo_root/.nojekyll"