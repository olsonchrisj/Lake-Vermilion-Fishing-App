# Lake Vermilion Fishing App

A phone-first web app (PWA) for fishing Lake Vermilion. No install from an app
store needed — open it in your phone browser and add it to your home screen.

## What's in it

- **Bathymetry**: real MN DNR contour lines (same survey behind LakeFinder),
  bundled as `bathymetry.js` and drawn as vector lines client-side — colored
  by depth, with numeric depth labels on the lines once you zoom in (13+).
  Rendering it ourselves instead of using the DNR's raster export is what
  makes the labels possible and keeps lines crisp at any zoom. Toggle it
  on/off, or switch the base map to satellite.
- **Live weather**: current conditions + 6-period forecast from the National
  Weather Service (`api.weather.gov`), no API key needed.
- **Current fishing reports**: pulled automatically, daily, from two named
  guide sources (Patriot Guide Service and Fishing with Z) — no AI involved
  in the refresh, see "How the daily refresh works" below. Anything older
  than 14 days is automatically filtered out of the panel rather than shown
  as if it were current. There's also a weather angle (fronts, wind shifts)
  computed live from the forecast every time the app loads — also rule-based,
  not AI.
- **Recommended spots** (29 as of this writing): pins tied to what's actually
  producing right now — species, structure type, technique, and the
  conditions each spot fishes best in. Two kinds of pin: named bays/points
  (teardrop pins, from OpenStreetMap's real place names — pulled systematically
  via an Overpass query of every named bay/cape on the lake, not guessed one
  at a time) and sunken humps identified directly from the DNR contour data
  (small circle pins) — see "How the hump spots were found" below. Every named
  bay's depth range is checked against the DNR contours before it gets a
  writeup, so the structure description is real, not assumed. Tap a pin for
  the full writeup.
- **Species filter**: chips at the bottom show/hide pins by species.
- **My Location**: shows a live blue dot for where you are, updating as you
  move. Needs your phone's location permission the first time you tap it.

## Running it

Just open `index.html` — double-clicking it works fine. All the app's own data
(spots, reports, bathymetry) loads as plain `<script>` files, so it doesn't
need a web server for that. A server is only useful if you want to test it
like it'll behave once hosted:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` on your computer, or `http://<your-computer's-LAN-IP>:8000`
from your phone if it's on the same WiFi.

## Getting it on your phone for real use at the lake — GitHub Pages

This needs to be hosted somewhere reachable from cell signal, not just your
home network, and hosting it on GitHub Pages is also what makes the daily
auto-refresh below possible (it runs as a GitHub Action right in the same
repo). Steps:

1. **Create a free GitHub account** at [github.com](https://github.com) —
   this part only you can do (I can't create accounts on your behalf).
2. **Create a new repository**: click the "+" in the top right → "New
   repository". Name it something like `lake-vermilion-app`. Keep it Public
   (GitHub Pages' free tier needs that, unless you're on a paid plan). Don't
   add a README/gitignore — leave it empty.
3. **Upload the files**: on the new repo's page, click "uploading an existing
   file", then drag in every file and folder from this project (`index.html`,
   `app.js`, `data.js`, `style.css`, `bathymetry.js`, `reports.auto.js`,
   `manifest.json`, `sw.js`, `icons/`, `scripts/`, `.github/` — everything).
   Commit.
4. **Turn on GitHub Pages**: repo → Settings → Pages (left sidebar) → under
   "Build and deployment", Source = "Deploy from a branch", Branch = `main`,
   folder = `/ (root)` → Save. GitHub gives you a URL like
   `https://<your-username>.github.io/lake-vermilion-app/` within a minute or
   two.
5. Open that URL on your phone, then "Add to Home Screen" (Safari: Share →
   Add to Home Screen. Chrome: menu → Add to Home screen). It'll behave like
   an app icon from there.

Once the repo exists, tell me the URL (or just the `<username>/<repo>` part)
and I'll double check the Pages setup and the Action are both wired up right.

## How the daily refresh works — no AI needed

You asked whether this could run without needing me involved each time —
yes, and here's exactly what's automated:

- **Fishing reports**: `.github/workflows/refresh-reports.yml` is a GitHub
  Actions workflow that runs `scripts/refresh-reports.mjs` every day
  (currently ~6-7am Central). That script fetches Patriot Guide Service's and
  Fishing with Z's own report pages directly and pulls out the latest post's
  date, link, and text with plain pattern-matching — no AI, no summarizing,
  just extracting text that's already sitting in the page's HTML. It writes
  the result to `reports.auto.js` and commits it back to the repo only if
  something actually changed. GitHub Pages picks up the new file
  automatically. You'll see "(auto-pulled, unedited)" on these in the app so
  it's clear that's raw guide text, not my analysis.
- **Weather angle**: fully live and rule-based, computed in `app.js` itself
  every time the app loads (`computeWeatherAngle`) — it looks at the wind
  direction shift and precipitation in the live NWS forecast and applies one
  well-established idea (fish bite better right before a front, tighter to
  structure after one) plus basic wind-push logic. No daily job needed for
  this part since it's recalculated fresh on every page load anyway.
- **Report aging**: also automatic and needs nothing — `app.js` checks each
  report's date against `REPORT_MAX_AGE_DAYS` (14) on every load and hides
  anything older, no cleanup required.
- **Same week, past years**: `HISTORICAL_REPORTS` in `data.js` — this one's
  still hand-curated (it's a small, deliberately-picked set, not something
  worth scraping fresh), and only needs touching once a year around this
  time.

What's still **not** automated, and still needs me: the **spots** (`SPOTS` in
`data.js`) — those came from actually analyzing DNR contour data and matching
patterns to structure, which is judgment, not extraction. Ask me to revisit
them whenever conditions change enough to matter (especially **fall
turnover** — once that hits, the whole pre-turnover pattern the spots are
built around changes, and nothing in the app detects that on its own; you'll
need to tell me when it happens).

If the workflow ever stops updating `reports.auto.js` (e.g. a site redesign
breaks the pattern-matching), the repo's Actions tab will show the run
failing or warning in its log — that's your signal to ask me to fix the
scraper.

## How the hump spots were found

The DNR bathymetry service isn't just a picture — it's real depth-contour
geometry (line by line, in feet). For the "hump" pins, I queried that contour
data directly and looked for **closed depth rings with a small, compact
footprint sitting away from the shoreline** — i.e., a patch of shallower
water completely surrounded by deeper water, which is exactly what a sunken
hump or reef looks like in contour data. Each one is backed by an actual
DNR-surveyed ring (I noted its approximate size and top depth in the spot's
description), not a guess. What that method can't tell me is the small stuff
below a ~90 ft ring, or how sharp/rocky the structure actually is — bring
electronics to confirm the exact crown.

## Notes on the data

- Bathymetry: MN DNR Lake Bathymetric Contours service, basins DOW 69-0378-01
  (East Vermilion) and 69-0378-02 (West Vermilion) — together these two
  surveyed basins are all of Lake Vermilion. Survey dated 8/13/1958, 5 ft
  contour interval — that's the ceiling of detail in this free public
  dataset. It's noticeably coarser than a modern sonar-based chart
  (Navionics/C-MAP/LakeMaster use crowdsourced sonar at much finer intervals),
  but those aren't available as an open, embeddable data source — they're
  licensed products. If you already pay for one of those and want its detail
  in here, that'd mean integrating a paid API/SDK, which is a different
  scope of project — say the word if you want to look into it.
- Weather: NWS gridpoint DLH/78,121 (Duluth office).
- Named-spot coordinates are the approximate center of the bay/point/area
  (from OpenStreetMap); hump coordinates are the centroid of the DNR contour
  ring. Neither is an exact boat waypoint — dial in the actual spot with your
  electronics once you're in the area.
- Reports: Patriot Guide Service (patriotguideserviceoflakevermilion.com) and
  Fishing with Z (fishingwithz.com, Zach Hrvol) — both post weekly through the
  open-water season. The old single-source setup pulled from a syndicated
  repost of Zach Hrvol's report on lakevermilionresorts.com; that's now
  replaced with his own site directly.
