# Verification: Definition of Done

Run this before telling the user the file is ready.

## Checklist

1. Opens from disk (file://) with zero console errors. Allowed noise:
   the Tailwind Play CDN production warning; nothing else. Always test
   via file://, not a local server — file:// is the runtime users get.
2. Both light and dark themes render, body text contrast holds.
3. Interactivity works: every button/input responds; Tier 3 exercises at
   least one state change end to end.
4. Layout holds at 1280px and 390px widths.
5. Keyboard: tab reaches all controls, focus is visible.
6. `grep -n innerHTML <file>` — every hit needs a written justification
   (embedded data through innerHTML is an XSS vector in a file people
   double-click). Rendering paths use textContent or React text nodes.
7. Report file size and load method to the user.

## Playwright check (use when available in the session)

```js
// verify.mjs  — run: node verify.mjs ./my-app.html
import { chromium } from "playwright";
import { pathToFileURL } from "url";

const file = pathToFileURL(process.argv[2]).href;
const browser = await chromium.launch();
const errors = [];

for (const scheme of ["light", "dark"]) {
  for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: vp });
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`[${scheme}/${vp.width}] ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`[${scheme}/${vp.width}] ${e.message}`));
    await page.goto(file, { waitUntil: "networkidle" });
    await page.screenshot({ path: `verify-${scheme}-${vp.width}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
const real = errors.filter((e) => !e.includes("cdn.tailwindcss.com"));
if (real.length) { console.error("FAIL\n" + real.join("\n")); process.exit(1); }
console.log("PASS: no console errors across 4 configurations");
```

If Playwright is not installed and installing is disproportionate, do the
manual checklist and say so explicitly rather than skipping verification.
