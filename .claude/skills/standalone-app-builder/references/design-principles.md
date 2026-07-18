# Design Principles

The goal is output that looks intentional, not machine-generated.

## Banned (machine-generated tells)

- Purple/indigo gradient headers and gradient text as a default move
- Uniform border-radius on every element
- Emoji as bullet points or section markers
- Everything centered; hero-style layouts on utilitarian tools
- Glassmorphism cards floating over gradient orbs to "represent AI"
- Inter as the reflexive font choice
- Placeholder lorem ipsum in anything called done
- Identical card grids where a table would carry more information
- `alert()`, `confirm()`, `prompt()` — blocking dialogs feel broken and
  fail in some embedded webviews. Inline messaging only: validation under
  the field, confirmation as an inline flash, destructive confirms as an
  in-page two-step.

## Required

- **Declare a system first**: one comment block at the top of the styles
  naming the type scale, spacing unit, and palette. Then obey it.
- **Density where it belongs**: tools and dashboards are dense (think
  spreadsheet, not billboard). Marketing-style spacing only for
  marketing-style pages.
- **Real type scale**: pick 4 or 5 sizes from a ratio and stick to them.
- **Both themes pass WCAG AA** for body text (4.5:1). The tokens in the
  shells already pass; keep them passing when you change colors.
- **Visible focus states** on every interactive element. Never
  `outline: none` without a replacement.
- **Keyboard works**: tab order sensible, Enter/Space activate, Escape
  closes overlays, arrow keys navigate decks.
- **Numbers formatted**: thousands separators, sensible precision,
  tabular-nums for columns of figures.
- **Empty, loading, and error states** exist for anything data-driven.

## Offering directions (Tier 3 design-forward work only)

When the request is a mockup or prototype AND visual direction is
genuinely open, propose 2 or 3 differentiated directions (one sentence
each, named after a real school: Swiss editorial, dense utilitarian,
warm paper, brutalist, etc.) and let the user pick before building.
Skip this entirely for tools, dashboards, and anything where the user
just wants the thing.
