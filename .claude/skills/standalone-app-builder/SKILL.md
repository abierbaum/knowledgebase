---
# version: 0.1.0 (2026-07-17)
name: standalone-app-builder
description: >
  Build complete, self-contained single-file HTML applications that open
  directly in a browser with no build step, no server, and no npm. Use this
  skill whenever the user asks for a standalone app, single-file app, HTML
  app or page, interactive tool, dashboard, data visualization, application
  mockup, prototype, wireframe, calculator, slide deck, data explorer,
  interactive explainer, or anything "like a Claude artifact" or "something
  I can just open in a browser." Also use it when the user asks to iterate
  on an HTML file this skill previously produced. Do NOT use this skill for
  work inside an existing application codebase (bug fixes, refactors,
  components for a Vue/React/Next/Vite project) or when the user explicitly
  wants a scaffolded project with a build pipeline.
---

# Standalone App Builder

Produce exactly one self-contained `.html` file per app. It must open from
disk in a modern browser with zero console errors. No build tooling, ever.

## Workflow

1. **Clarify only if genuinely ambiguous.** One question maximum. Otherwise
   proceed with stated assumptions.
2. **Pick a tier and say so** in one sentence before writing any code
   (example: "Tier 3, since this is a multi-view mockup with shared state").
   - **Tier 1 (vanilla)**: HTML + CSS + vanilla JS, zero dependencies.
     For utilities, converters, simple forms, static reference pages.
   - **Tier 2 (enhanced)**: vanilla base plus libraries from the CDN
     manifest. Alpine.js for light reactivity. For dashboards, charts,
     diagrams, maps, data explorers.
   - **Tier 3 (React)**: React 18 + ReactDOM + Babel standalone + Tailwind
     Play CDN, compiled inline in the browser. For app mockups, multi-view
     prototypes, complex component state. This is the Claude.ai artifact
     experience as a local file.
   - Routing rules: component state or multiple screens or "mockup /
     prototype" language means Tier 3. Charts/diagrams/maps as the
     centerpiece with simple interactions means Tier 2. Everything else
     starts Tier 1. If the user names a tier or library, obey them.
3. **Read `references/cdn-manifest.md`** before adding ANY external
   library. Copy script tags verbatim, including integrity attributes.
   Never type a CDN URL from memory. If a needed library is not in the
   manifest, stop and ask; do not silently add one.
4. **Read the matching section of `references/app-patterns.md`** for the
   app type you are building.
5. **Start from the tier's shell** in `assets/` (shell-vanilla.html,
   shell-enhanced.html, or shell-react.html). Build inside it. Do not
   free-hand the boilerplate.
6. **Apply `references/design-principles.md`.** For Tier 3 mockups where
   visual direction is unclear AND the user seems to care about design,
   offer 2 or 3 differentiated directions before committing. Never do this
   for utilitarian tools.
7. **Embed data** per `references/data-embedding.md` when the app ships
   with data. Synthetic data by default for mockups. Never embed real PII,
   PHI, secrets, or tokens.
8. **Verify** per `references/verification.md` before declaring done.
9. **Write the file** to `./<kebab-case-name>.html` unless the user gave a
   path. Never write to /tmp. Fill in the stamp comment near the top of the
   shell (skill version, tier, date). Report the final file size and note
   that the user can open it by double-clicking or with `open <file>`.

## Hard rules

- One `.html` file per app. Everything inline except manifest CDN scripts.
- Pinned CDN URLs with SRI from the manifest only. No `@latest`.
- No build step, no npm, no bundler. If the request genuinely requires one
  (client-side routing across real URLs, npm-only packages, SSR, backend),
  say so and recommend a real project instead.
- No fetch() of local files. Data ships embedded (file:// blocks fetch).
- Use the storage wrapper from the shells; never call localStorage bare.
- **No real PII, PHI, credentials, API keys, or internal-only URLs — ever.**
  These files are plaintext, unencrypted, and get emailed around. Mockups
  use synthetic data. Classroom Clinic data appears aggregated and
  de-identified only.
- State the tier before coding. Keep the preamble to one sentence.

## Portability note

Claude.ai artifact compatibility is a soft goal, not a guarantee: the
manifest standardizes on cdnjs, storage goes through `appStorage`, and
everything is single-file, so most output pastes into an artifact with
minimal surgery. Documented exceptions (e.g. the jsDelivr fallback for
Lucide) break that portability for the file that uses them — mention it
when one applies.

## When to read what

| File | Read when |
|---|---|
| references/cdn-manifest.md | Any external library is needed |
| references/react-babel-traps.md | Tier 3, before writing JSX |
| references/design-principles.md | Every build, before styling |
| references/app-patterns.md | The app matches a listed type |
| references/data-embedding.md | The app ships with data |
| references/verification.md | Before declaring done |
