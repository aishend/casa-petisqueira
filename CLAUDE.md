# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Two static sites for Casa da Petisqueira, a short-term rental business, generated from one codebase:
- `dist/` (casadapetisqueira.com): 3 apartments in Rebordosa, Paredes (near Porto)
- `dist-bungalow/`: its own one-page site for the bungalow in Seia (Serra da Estrela). The domain is not chosen yet; set `SITES.bungalow.url` and `cname: true` in `src/data.mjs` once it is.

Both sites are in 8 languages (`LANGS`: en, pt, es, fr, de, it, nl, pl; English is the default). The owner communicates in European Portuguese, so code comments are written in pt-PT.

The owner wants as little text as possible and an intuitive design that doesn't look generic or "AI-made". Show information with icons and brand logos instead of prose: monochrome line icons for facts, amenities and beds, and brand logos (WhatsApp, Facebook, Google Maps, Waze, Booking.com) on their buttons. Avoid pills and coloured circles; use thin borders rather than heavy shadows. Don't add descriptive paragraphs, marketing phrases ("melhor preço garantido", "refúgio", "experiência inesquecível"), unverifiable stats, decorative eyebrow labels or filler sections.

## Commands

- `npm run build` (= `node src/build.mjs`): generates both sites (`dist/` and `dist-bungalow/`). It has **zero npm dependencies**, so don't add any without a strong reason.
- `npm run dev` / `npm run dev:bungalow`: builds, then serves `dist/` on port 8080 / `dist-bungalow/` on port 8081 (bound to 0.0.0.0 so a phone on the same Wi-Fi can open it).
- `npm run images` (= `scripts/optimize-images.sh [--force]`): turns `fotos-originais/` into `static/img/` and `static/video/`. It needs `vips` and `ffmpeg` and only runs locally, never in CI.

There are no tests or linter. To verify a change, build it and check the pages in a browser (headless Chromium works).

## Architecture

- `src/data.mjs` is the single source of content. `SITES` defines each site (output dir, URL, which properties, map location, hero photo). It also holds the contact info (`SITE`), map locations with distances (`LOCATIONS`), `PROPERTIES`, the UI strings (`T[lang]`), `ROUTES` and `REDIRECTS`.
- `PROPERTIES` is structured data with no prose: `guests` ([in beds, on sofa beds]), `rooms` (bed type per bedroom), `sofas`, `bathrooms`, `area`, `amenities` (keys into `T[lang].am` and the `ICON` set in `build.mjs`; the first 4 are shown on the cards) and `booking` (the Booking.com URL without its `.xx.html` language suffix). All translated text lives in `T`.
- `ROUTES` is generated from `SLUGS`. It maps each page key to its URL in each language. The slugs are translated, and pt/en/fr intentionally keep the old site's URLs (e.g. `/propriedades/apartamento-61/` = `/en/properties/house-61/` = `/fr/proprietes/maison-61/`). To add a language, add it to `LANGS`, `SLUGS`, `BOOKING_LANG` and `T`, and add its flag to `FLAG` in `build.mjs`. The language switcher and `hreflang` tags are both built from this table, so adding a page means adding an entry here.
- `src/build.mjs` is plain template-literal HTML generation. `buildSite(key)` calls `useSite(key)`, which swaps the module-level `SITE`/`ROUTES`/`PROPERTIES`/`HERO`/`DIST` values, then renders that site. The bungalow site uses `propertyPage(p, lang, { standalone: true })` as its home page (one page per language: `/`, `/en/`, `/fr/`). Each build does the following:
  - copies `static/` into the output dir, skipping photos and videos of properties that belong to the other site
  - writes `src/styles.css` and `src/main.js` into `dist/assets/` (cache-busted with `?v=<hash>`)
  - renders the home, contact, booking and property pages for each language
  - writes meta-refresh redirects for old URLs, a 404 page, `sitemap.xml` and `robots.txt`
  - reads image dimensions straight from the WebP headers, to set `width`/`height`/`srcset`
- Photos are numbered: `static/img/<property-id>/NN-{480,1024,1920}.webp`. The gallery order is the file order. `featured` in `PROPERTIES` lists the photo numbers for the mosaic (the first one is the cover). The photo count comes from the files.
- `src/main.js` handles the mobile menu, the booking dialog, the map tabs, the photo carousel counter and the lightbox. The lightbox reads its photo list from the `data-gallery` JSON on `.gallery`.
- Every "Reservar" button is a link to Amenitiz (`SITE.bookingEngine(lang)`) with `data-book`. `main.js` intercepts it and opens the `#booking` `<dialog>`, which is full screen on phones and a large modal on desktop. The Amenitiz iframe gets its `src` on the first open, on pointerdown, or 3 s after the page loads on a good connection (not with Save-Data or 2G). Without JS, the link opens Amenitiz directly. Opening the dialog pushes a `#reservar` history entry, so the phone's back button closes it. The dialog bar has a WhatsApp help button and an "open in new window" link, because Amenitiz's session cookie is `SameSite=Lax` and some browsers may block it inside a cross-site iframe. If the iframe hasn't loaded after 8 s, a big "open in new window" button appears. When the dialog closes, the iframe is replaced by a fresh one, which preloads again on a good connection. Otherwise Amenitiz's `beforeunload` handler made the browser ask "leave site?" on every later navigation. The URL ends with `#DatesGuests-BE`, which opens the engine at the date/guest step.
- The date and guest picker (`picker()`, `[data-picker]` in `main.js`) appears on the home page and at the top of each property page. It opens the sheet at `…/booking/room?start_date=YYYY-MM-DD&end_date=…&adults=N&children=N#RoomSelection-BE`, which is the list of houses with prices for those dates. This was found by using the engine in a real browser. Without JS, the form submits to the same URL. Total guests are capped at the house's capacity (`guests` sum).
- Amenitiz's room IDs are stored as `amenitiz` in `PROPERTIES`. No URL parameter to preselect a single room was found.
- Prices can't be shown on our own pages. The engine's JSON API (`/api_public/v1/client_booking_engine/room_availability`) sends no CORS headers, so a static site can't read it. It would need a server-side proxy. The `/reservar/` page embeds the iframe full height.
- Amenitiz is behind Cloudflare and blocks headless browsers, so the iframe looks broken in automated screenshots. Test it on a real device.
- Mobile-first: a fixed bottom bar (`.bar`: Ligar / WhatsApp / Reservar) shows below 900px. Breakpoints are 768px (property gallery: swipe carousel → mosaic) and 900px (header nav, map + distances side by side, house rail → grid).
- `mapBlock()` renders a Google Maps embed with Google Maps and Waze directions buttons built from `LOCATIONS[k].geo`. `main.js` still supports tabbed maps (`.tabs`, `data-src` iframes), but no page uses them now that each site has a single location.
- The home page starts with the essentials: booking button, phone number, WhatsApp, then the map (with distances beside it on desktop). Keep that order. The three houses sit in three equal columns on desktop (`.rail--3`).
- Language: an inline `<head>` script (`langScript`) picks the language on the first visit. It uses the saved choice (`localStorage.lang`, set when a flag is clicked), otherwise the first device language that the site has, otherwise English. It reads the target URL from the page's `hreflang` links, skips bots and same-site navigation, and `x-default` is English. The switcher is a `<details>` with SVG flags, always visible in the header. It has a search box that filters by language or country, matching against `T[lang].terms` without accents.
- Old bungalow URLs on the main site redirect to the bungalow site (`REDIRECTS` values prefixed `BUNGALOW:`).
- The font is self-hosted (`static/fonts/jakarta.woff2`, Plus Jakarta Sans latin, preloaded). Don't add external font or CSS requests.

## Deploy

`.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`. The Pages source must be set to "GitHub Actions". The CNAME file is written by the build from `SITES[...].url`. The bungalow site is not deployed yet: GitHub Pages serves one site per repo, so it needs its own repo or another host once its domain is chosen. `dist/`, `dist-bungalow/` and `fotos-originais/` (the heavy originals) are git-ignored, while the optimized `static/img` files are committed.
