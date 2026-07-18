# Embedding Data

Single-file means data ships inside the file. `fetch()` of local paths
fails on file:// so there is no other option for bundled data.

## Preferred: JSON script block

```html
<script type="application/json" id="app-data">
{ "generated": "2026-07-17", "rows": [ { "district": "Sample CSD", "value": 42 } ] }
</script>
<script>
  const APP_DATA = JSON.parse(document.getElementById("app-data").textContent);
</script>
```

Why this over a JS literal: it keeps data inert (no code execution in the
data block), diffable, and trivially replaceable in later edits.

## Escaping rule (matters)

If any string in the data can contain `</script`, escape it before
embedding: replace `</` with `<\/` when serializing. Data that renders
into the DOM goes through `textContent` or React text nodes, never
`innerHTML`. Treat embedded data as untrusted even when it looks tame.

## CSV input

Convert to JSON at generation time. Do not ship a CSV parser unless the
user wants runtime upload, in which case:

```html
<input type="file" accept=".csv" id="csv-in">
<script>
  document.getElementById("csv-in").addEventListener("change", (e) => {
    const reader = new FileReader();
    reader.onload = () => renderFromCsv(reader.result);
    reader.readAsText(e.target.files[0]);
  });
</script>
```

(and then a small hand-rolled parser handling quoted fields, or propose
adding PapaParse to the manifest if the CSVs are gnarly).

## Size guidance

- Under ~2 MB embedded: fine.
- 2-10 MB: warn the user, suggest aggregating or sampling first.
- Over 10 MB: do not embed; aggregate at generation time or switch to the
  runtime-upload pattern.
- Always report final file size when done.

## Never embed

Real PII or PHI, credentials, API keys, tokens, internal hostnames or
URLs that should not travel. These files are plaintext, unencrypted at
rest, and get emailed around. Mockups use synthetic data, full stop.
