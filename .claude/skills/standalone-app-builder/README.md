# standalone-app-builder

A Claude Code skill (v0.1.0) that produces self-contained single-file HTML
apps: open from disk, no build step, no server, no npm. Claude reads
`SKILL.md` and the `references/` files; this README is for humans.

## Install

Already installed here (`.claude/skills/standalone-app-builder/` in this
repo). To use elsewhere, copy or symlink this folder into that project's
`.claude/skills/`.

## The tiers

| Tier | Stack | For |
|---|---|---|
| 1 | Vanilla HTML/CSS/JS | Utilities, converters, simple forms |
| 2 | Vanilla + manifest libraries (Chart.js, Mermaid, Alpine, …) | Dashboards, diagrams, maps, data explorers |
| 3 | React 18 UMD + Babel inline + Tailwind Play CDN | App mockups, multi-screen prototypes |

Tier 3 is deliberately frozen on React 18.x — React 19 dropped UMD builds,
and moving to ESM import maps would break Claude.ai artifact portability.

## Updating the CDN manifest

Every allowed library is pinned with an SRI hash in
`references/cdn-manifest.md`. To bump a version: change the URL there,
recompute the hash (command is in that file), re-verify the demos, and
commit. `scripts/check-manifest.sh` re-fetches every pin and fails on
drift — run it occasionally; cdnjs rarely yanks files, but rarely is not
never.

## Verifying output

`references/verification.md` has the manual checklist and a Playwright
script (`verify.mjs`) that opens a file in light/dark at desktop/mobile
widths and fails on any console error.

## Evals

`test-prompts.json` holds routing and output-quality test cases. Re-run
them after any meaningful SKILL.md edit — the routing cases (off-manifest
library, needs-a-real-build, explicit tier override) are the likeliest to
regress.

## Stubs / future work

- **Vendored (truly offline) mode**: today the CDN scripts need network at
  least once per browser cache. A v2 mode could inline library source into
  the file for demos on hostile wifi — bigger files, zero network.
- **Graduation path**: when a Tier 3 mockup becomes a real product, port
  the components into a Vite + React project; the components transfer, the
  babel-inline shell does not. Do not iterate a 3,000-line babel block past
  the point it should have become a repo.
