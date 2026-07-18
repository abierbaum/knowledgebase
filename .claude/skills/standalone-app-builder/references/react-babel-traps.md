# React + Babel Inline: Known Traps

Read this before writing any Tier 3 code. Every item here has silently
produced a blank page for someone.

## 1. No import/export statements

The app runs as a `<script type="text/babel">` block against UMD globals.
`React`, `ReactDOM`, and hooks come from globals, not modules.

```jsx
// WRONG: there is no module system here
import { useState } from "react";

// RIGHT
const { useState, useEffect, useMemo, useRef } = React;
```

Any `import` line makes Babel emit module code the browser will not run
in this context. Same for `export default`.

## 2. Script block scope isolation

Each `<script type="text/babel">` block is compiled and executed in its
own scope. Components defined in block A are invisible in block B unless
you explicitly attach them to `window`. Default rule: exactly ONE babel
script block per file. If you must split, `window.MyComponent = ...`.

## 3. Define before use across the file

Babel-compiled function components behave like const declarations for
practical purposes. Order components so that anything referenced is
defined above its first use. Do not rely on hoisting.

## 4. Style object collisions

A file-level `const styles = {...}` in more than one section of a large
generated file is a redeclaration error that surfaces as a blank page.
Name style objects per component (`cardStyles`, `navStyles`) or use
Tailwind classes and skip style objects entirely.

## 5. Always mount with an error boundary

A runtime error in a bare mount renders nothing. The shell includes an
`ErrorBoundary` and a `mount()` helper; use them. A readable red box
beats a blank page in every situation.

## 6. Storage safety

`localStorage` can throw (privacy modes, some file:// contexts, and it is
unavailable if the file is later pasted into a Claude.ai artifact). The
shells define `appStorage` with an in-memory fallback. Never call
localStorage directly.

## 7. Tailwind Play CDN specifics

- Config goes in an inline `tailwind.config = {...}` script AFTER the CDN
  script tag.
- Dynamic class names built by string concatenation will not exist
  (`"bg-" + color + "-500"` fails). Use complete class strings, maps of
  full class names, or inline style for truly dynamic values.
- The "cdn.tailwindcss.com should not be used in production" console
  warning is expected; verification treats it as allowed noise.

## 8. Charts inside React

Chart.js is not React-aware. Wrap it: create the chart in `useEffect`,
store the instance in a ref, destroy on cleanup, update via the instance
rather than re-creating per render. app-patterns.md has the wrapper.

## 9. SRI and pinning

Integrity hashes mean a CDN compromise or a silent file change fails
closed (the script refuses to load) instead of executing. That failure
mode looks like "React is not defined." If you see that error with an
unmodified shell, re-verify the hash against the manifest; do not delete
the integrity attribute to "fix" it.
