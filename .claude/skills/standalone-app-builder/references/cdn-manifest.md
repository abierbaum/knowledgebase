# CDN Manifest

The only external resources any generated file may reference. Copy tags
verbatim. Never modify a URL, never use `@latest`, never add an entry
inline in a generated file. Adding a library means editing THIS file in a
reviewed commit.

All pins below were verified against the live CDN and all hashes computed
from the fetched files on **2026-07-17**.

## Regenerating an SRI hash

```bash
curl -sL "<url>" | openssl dgst -sha384 -binary | openssl base64 -A
```

Prefix the output with `sha384-`. Recompute whenever a pin changes.
`scripts/check-manifest.sh` (in the skill root) re-fetches every pin and
fails on drift; run it occasionally.

## Tier 3 core (React stack)

React 19 removed UMD builds. Stay on 18.x for this pattern; see the note
at the bottom before ever bumping.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
        integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"
        integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.4/babel.min.js"
        integrity="sha384-x/ilTFv/u/eu6YSmkFDZl5V5Mm/pkxxcVv2cVJOrr1J0rvILhMvRBCy6yA75wYBj" crossorigin="anonymous"></script>
<script src="https://cdn.tailwindcss.com/3.4.16"></script>
<!-- Tailwind Play CDN serves a dynamic script; SRI is not available.
     This is a documented, deliberate exception. Pin the version in the
     URL. It also logs a "not for production" console warning; that
     warning is expected and acceptable for these files. -->
```

## Tier 2 libraries (all optional)

```html
<!-- Chart.js 4.5.0: standard charts (bar, line, pie, radar, mixed).
     (cdnjs does not host 4.4.7; 4.5.0 is the verified pin.) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js"
        integrity="sha384-XcdcwHqIPULERb2yDEM4R0XaQKU3YnDsrTmjACBZyfdVVqjh6xQ4/DCMd7XLcA6Y" crossorigin="anonymous"></script>

<!-- D3 7.9.0: bespoke visualizations ONLY when Chart.js cannot express it -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"
        integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i" crossorigin="anonymous"></script>

<!-- Mermaid 11.12.0: diagrams from text.
     (cdnjs does not host 11.4.1; 11.12.0 is the verified pin.) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js"
        integrity="sha384-o+g/BxPwhi0C3RK7oQBxQuNimeafQ3GE/ST4iT2BxVI4Wzt60SH4pq9iXVYujjaS" crossorigin="anonymous"></script>

<!-- Alpine.js 3.14.8: light reactivity for Tier 2 (defer is required) -->
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.14.8/cdn.min.js"
        integrity="sha384-X9kJyAubVxnP0hcA+AMMs21U445qsnqhnUF8EBlEpP3a42Kh/JwWjlv2ZcvGfphb" crossorigin="anonymous"></script>

<!-- Leaflet 1.9.4: maps (CSS must come before JS) -->
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      integrity="sha384-c6Rcwz4e4CITMbu/NBmnNS8yN2sC3cUElMEMfP3vqqKFp7GOYaaBBCqmaWBjmkjb" crossorigin="anonymous">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
        integrity="sha384-NElt3Op+9NBMCYaef5HxeJmU4Xeard/Lku8ek6hoPTvYkQPh3zLIrJP7KiRocsxO" crossorigin="anonymous"></script>

<!-- Three.js r128: 3D. Newer releases are ESM-only; r128 is the last
     broadly-cached UMD build and matches Claude.ai artifact conventions.
     Moving newer requires the import-map pattern (see note below). -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        integrity="sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu" crossorigin="anonymous"></script>

<!-- Lucide 0.469.0: static SVG icons (renders <i data-lucide="x">).
     DEVIATION: lucide is not hosted on cdnjs at all, so this is the
     approved jsDelivr fallback. Using it breaks Claude.ai artifact
     portability for the file; note that in a comment when used. -->
<script src="https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js"
        integrity="sha384-hJnF5AwidE18GSWTAGHv3ByzzvfNZ1Tcx5y1UUV3WkauuMCEzBJBMSwSt/PUPXnM" crossorigin="anonymous"></script>
```

## Policy notes

- **Why cdnjs as the primary host**: Claude.ai's artifact sandbox only
  permits cdnjs.cloudflare.com. Standardizing on cdnjs means any file this
  skill produces can also be pasted into a Claude.ai artifact with minimal
  surgery. jsDelivr is an approved fallback for libraries cdnjs lacks
  (currently only Lucide); note the deviation in a comment when used.
- **React 19+**: no UMD builds exist. Upgrading means switching Tier 3 to
  ESM import maps against esm.sh, which breaks Claude.ai artifact
  portability. Do not bump casually; treat it as a design change.
- **Version bumps** are commits to this file, with hashes recomputed, and
  ideally the demos re-verified.
- **Fonts**: default is the system font stack (no network). Google Fonts
  is allowed only when the user asks for a specific typeface; link tags
  do not get SRI (Google serves per-UA CSS), so note the exception inline.
