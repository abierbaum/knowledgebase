# App Patterns

Skeletons and gotchas per app type. Find your type, follow it.

## 1. Dashboard (Tier 2, or Tier 3 if heavy filtering/state)

Skeleton: header with title + date range, KPI card row (4-6 cards),
chart grid (2x2 or main+side), optional detail table.
- Chart.js inside CSS grid: wrap each canvas in a positioned div with an
  explicit height, `maintainAspectRatio: false`. Bare canvases in grid
  cells cause runaway resize loops.
- One shared color array; do not restyle per chart.
- KPI cards show value, label, and delta vs prior period.

React + Chart.js wrapper (Tier 3):

```jsx
function ChartBox({ config, height = 260 }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);
  React.useEffect(() => {
    chartRef.current = new Chart(canvasRef.current, config);
    return () => chartRef.current?.destroy();
  }, []);
  React.useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data = config.data;
    chartRef.current.update();
  }, [config.data]);
  return (
    <div style={{ position: "relative", height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
```

## 2. App mockup / prototype (Tier 3)

Skeleton: a `screen` state string, a `Screen` switch component, shared
state lifted to the top component, fake data module at the top of the
babel block.
- Navigation is state changes, never `<a href>` (file:// makes hrefs
  hazardous and there is no router).
- Offer a device frame (phone/browser chrome) when mocking a mobile or
  desktop app; plain full-bleed when mocking a web tool.
- Fake data: realistic shapes, synthetic values, small helper like
  `const people = mkPeople(12)`.

## 3. Data explorer (Tier 2 or 3)

Skeleton: search input, filter chips, sortable table, row count, detail
panel or expandable rows.
- Sort + filter derive from state; never mutate the source array.
- Above ~2,000 rows add simple windowing (render a slice) or paginate.
- Column headers show sort direction; clicking toggles.

## 4. Slide deck (Tier 1 or 2)

Skeleton: one `<section class="slide">` per slide, a fixed stage that
scales content, keyboard nav (arrows, Home/End), slide counter,
`@media print` making each slide a page.
- Scale via a single `transform: scale()` on a fixed-dimension stage
  (1280x720) computed from viewport; do not fight per-element sizes.
- Persist current slide with appStorage so refresh does not reset.

## 5. Utility / calculator (Tier 1)

Skeleton: single card, inputs top, result bottom, copy button.
- Compute on input event, no submit button unless the calculation is
  expensive.
- Copy button uses navigator.clipboard with a fallback textarea trick;
  confirm with an inline "Copied" flash, not an alert().
- Validate inline under the field, never with alert().

## 6. Technical explainer (Tier 2)

Skeleton: sticky table of contents, long-page sections, Mermaid diagrams,
code blocks with a copy button.
- Initialize Mermaid once: `mermaid.initialize({ startOnLoad: true, theme:
  matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default" })`.
- Re-render diagrams on manual theme toggle (destroy and re-init).
- Code highlighting: hand-rolled token spans for one or two languages
  beats shipping a highlighter library; only add one if code volume is
  large (then propose adding it to the manifest).
