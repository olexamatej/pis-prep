# pis-prep

PIS study site built with Quartz.

## Source of truth

These root Markdown files drive the generated website content:

- `PIS_priprava_speedrun(1).md`
- `PIS-najčastejšie otázky.md`
- `PIS-zbytok.md`

`./start.sh` and `scripts/publish-branch-site.sh` now regenerate `quartz/content` from those source files before serving or publishing the site.

If you edit one of the root Markdown files while the dev server is already running, restart `./start.sh` to regenerate the site.
