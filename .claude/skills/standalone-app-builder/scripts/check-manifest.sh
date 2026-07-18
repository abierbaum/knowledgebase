#!/usr/bin/env bash
# Re-fetch every pinned CDN file and verify its SRI hash still matches
# references/cdn-manifest.md. Exit nonzero on any drift or fetch failure.
# Keep the list below in sync with the manifest when pins change.
set -u

entries=(
"react 18.3.1|https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js|sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z"
"react-dom 18.3.1|https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js|sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1"
"babel-standalone 7.26.4|https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.4/babel.min.js|sha384-x/ilTFv/u/eu6YSmkFDZl5V5Mm/pkxxcVv2cVJOrr1J0rvILhMvRBCy6yA75wYBj"
"Chart.js 4.5.0|https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js|sha384-XcdcwHqIPULERb2yDEM4R0XaQKU3YnDsrTmjACBZyfdVVqjh6xQ4/DCMd7XLcA6Y"
"d3 7.9.0|https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js|sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i"
"mermaid 11.12.0|https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.12.0/mermaid.min.js|sha384-o+g/BxPwhi0C3RK7oQBxQuNimeafQ3GE/ST4iT2BxVI4Wzt60SH4pq9iXVYujjaS"
"alpinejs 3.14.8|https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.14.8/cdn.min.js|sha384-X9kJyAubVxnP0hcA+AMMs21U445qsnqhnUF8EBlEpP3a42Kh/JwWjlv2ZcvGfphb"
"leaflet css 1.9.4|https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css|sha384-c6Rcwz4e4CITMbu/NBmnNS8yN2sC3cUElMEMfP3vqqKFp7GOYaaBBCqmaWBjmkjb"
"leaflet js 1.9.4|https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js|sha384-NElt3Op+9NBMCYaef5HxeJmU4Xeard/Lku8ek6hoPTvYkQPh3zLIrJP7KiRocsxO"
"three r128|https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js|sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu"
"lucide 0.469.0 (jsDelivr)|https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js|sha384-hJnF5AwidE18GSWTAGHv3ByzzvfNZ1Tcx5y1UUV3WkauuMCEzBJBMSwSt/PUPXnM"
)

fail=0
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
for entry in "${entries[@]}"; do
  name="${entry%%|*}"; rest="${entry#*|}"
  url="${rest%%|*}"; expected="${rest#*|}"
  curl -sfL --max-time 60 -o "$tmp" "$url" || { echo "FAIL  $name: fetch error ($url)"; fail=1; continue; }
  actual="sha384-$(openssl dgst -sha384 -binary "$tmp" | openssl base64 -A)"
  if [ "$actual" = "$expected" ]; then
    echo "ok    $name"
  else
    echo "DRIFT $name"
    echo "      expected $expected"
    echo "      actual   $actual"
    fail=1
  fi
done

# Tailwind Play CDN has no SRI (dynamic script); just confirm the pinned URL resolves.
if curl -sfL --max-time 60 -o /dev/null "https://cdn.tailwindcss.com/3.4.16"; then
  echo "ok    tailwind 3.4.16 (reachable; no SRI by design)"
else
  echo "FAIL  tailwind 3.4.16: fetch error"
  fail=1
fi

exit $fail
