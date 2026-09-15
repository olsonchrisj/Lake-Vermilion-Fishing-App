// Lake Vermilion Fishing App

const map = L.map('map', { zoomControl: false, attributionControl: true });
map.attributionControl.setPrefix(false); // drop the clickable "Leaflet" link, keep required OSM credit
L.control.zoom({ position: 'bottomright' }).addTo(map);

function fitLake() {
  map.invalidateSize();
  map.fitBounds(LAKE.bounds, { animate: false });
}
fitLake();
requestAnimationFrame(fitLake);
window.addEventListener('load', () => { if (map.getZoom() < 4) fitLake(); });
// Belt-and-suspenders: some mobile browsers report a 0-size container on first
// paint, which makes fitBounds fall back to zoom 0. Re-check shortly after load.
setTimeout(() => { if (map.getZoom() < 4) fitLake(); }, 300);
setTimeout(() => { if (map.getZoom() < 4) fitLake(); }, 1000);

const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19, attribution: 'Esri World Imagery' }
);

// --- Base map toggle ---
let usingSatellite = false;
document.getElementById('basemap-toggle').addEventListener('click', (e) => {
  usingSatellite = !usingSatellite;
  if (usingSatellite) {
    map.removeLayer(streets);
    satellite.addTo(map);
    e.target.textContent = 'Streets';
  } else {
    map.removeLayer(satellite);
    streets.addTo(map);
    e.target.textContent = 'Satellite';
  }
});

// --- My Location ---
let watchId = null;
let locationMarker = null;
const locateBtn = document.getElementById('locate-toggle');
const locationIcon = L.divIcon({
  className: '',
  html: `<div class="my-location-dot"><div class="my-location-pulse"></div></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

locateBtn.addEventListener('click', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    if (locationMarker) { map.removeLayer(locationMarker); locationMarker = null; }
    locateBtn.classList.remove('active');
    locateBtn.textContent = 'My Location';
    return;
  }
  if (!('geolocation' in navigator)) {
    locateBtn.textContent = 'Not supported';
    setTimeout(() => { locateBtn.textContent = 'My Location'; }, 2500);
    return;
  }
  locateBtn.textContent = 'Locating…';
  let centered = false;
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      if (!locationMarker) {
        locationMarker = L.marker(ll, { icon: locationIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        locationMarker.setLatLng(ll);
      }
      if (!centered) {
        map.setView(ll, Math.max(map.getZoom(), 14));
        centered = true;
      }
      locateBtn.classList.add('active');
      locateBtn.textContent = 'My Location';
    },
    (err) => {
      console.error('Geolocation error', err);
      locateBtn.textContent = err.code === err.PERMISSION_DENIED ? 'Permission denied' : 'Location unavailable';
      setTimeout(() => { locateBtn.textContent = 'My Location'; }, 3000);
      watchId = null;
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
});

// --- Bathymetry: real MN DNR contour data, rendered client-side so lines stay ---
// crisp at any zoom and we can label depths directly on the map (the DNR's own
// dynamic map service only offers a flattened raster export with no labels).
// The data lives in bathymetry.js as a plain BATHYMETRY_TEXT string (loaded via a
// <script> tag, same as data.js) rather than a fetched .txt file — fetch() of a
// local file is blocked by the browser when you open index.html directly instead
// of through a web server, and a script tag isn't. It's pre-pulled from the DNR's
// bathymetry MapServer (DOW 69-0378-01 and 69-0378-02, the two surveyed basins
// that make up Lake Vermilion) and simplified slightly (~8 ft tolerance) to keep
// it small — the source survey is from 1958 at 5 ft contour intervals, so that's
// well within its own precision.
const DEPTH_COLORS = {
  0: '#7fbf9e',
  '-5': '#59a8c9',
  '-10': '#3f8fc4',
  '-15': '#2f74bb',
  '-20': '#245cae',
  '-30': '#1c4590',
  '-40': '#153370',
  '-50': '#0f2450',
  '-60': '#0a1836',
  '-70': '#060f22'
};
function depthColor(depth) {
  return DEPTH_COLORS[String(depth)] || '#2f74bb';
}

const bathyLines = L.layerGroup();
const bathyLabels = L.layerGroup();
let bathyVisible = true;

function updateBathyLabelVisibility() {
  if (!bathyVisible) {
    if (map.hasLayer(bathyLabels)) map.removeLayer(bathyLabels);
    return;
  }
  if (map.getZoom() >= 13) {
    if (!map.hasLayer(bathyLabels)) bathyLabels.addTo(map);
  } else if (map.hasLayer(bathyLabels)) {
    map.removeLayer(bathyLabels);
  }
}
map.on('zoomend', updateBathyLabelVisibility);

function loadBathymetry() {
  try {
    if (typeof BATHYMETRY_TEXT === 'undefined') throw new Error('bathymetry.js not loaded');
    const lines = BATHYMETRY_TEXT.split('\n').filter(Boolean);
    for (const line of lines) {
      const parts = line.split(',');
      const depth = parseInt(parts[0], 10);
      const coords = [];
      for (let i = 2; i + 1 < parts.length; i += 2) {
        coords.push([parseFloat(parts[i + 1]), parseFloat(parts[i])]); // [lat, lon]
      }
      if (coords.length < 2) continue;
      const isShoreline = depth === 0;
      const poly = L.polyline(coords, {
        color: depthColor(depth),
        weight: isShoreline ? 2.4 : 1.3,
        opacity: isShoreline ? 0.9 : 0.75
      });
      bathyLines.addLayer(poly);
      if (!isShoreline) {
        const mid = coords[Math.floor(coords.length / 2)];
        bathyLabels.addLayer(L.marker(mid, {
          icon: L.divIcon({
            className: 'depth-label',
            html: `${Math.abs(depth)}`,
            iconSize: [20, 14],
            iconAnchor: [10, 7]
          }),
          interactive: false
        }));
      }
    }
    bathyLines.addTo(map);
    updateBathyLabelVisibility();
  } catch (err) {
    console.error('Bathymetry load failed', err);
  }
}
loadBathymetry();

// --- Bathymetry toggle ---
const bathyBtn = document.getElementById('bathy-toggle');
bathyBtn.addEventListener('click', () => {
  bathyVisible = !bathyVisible;
  if (bathyVisible) {
    bathyLines.addTo(map);
    bathyBtn.classList.add('active');
  } else {
    map.removeLayer(bathyLines);
    bathyBtn.classList.remove('active');
  }
  updateBathyLabelVisibility();
});

// --- Species filter state ---
const activeSpecies = new Set(Object.keys(SPECIES_INFO));
const markersById = {};

function speciesFilterMatch(spot) {
  return spot.species.some(s => activeSpecies.has(s));
}

function refreshMarkerVisibility() {
  SPOTS.forEach(spot => {
    const m = markersById[spot.id];
    if (!m) return;
    const show = speciesFilterMatch(spot);
    if (show && !map.hasLayer(m)) m.addTo(map);
    if (!show && map.hasLayer(m)) map.removeLayer(m);
  });
}

function buildSpeciesFilterUI() {
  const container = document.getElementById('species-filter');
  Object.entries(SPECIES_INFO).forEach(([key, info]) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `<span class="dot" style="background:${info.color}"></span>${info.label}`;
    chip.addEventListener('click', () => {
      if (activeSpecies.has(key)) {
        activeSpecies.delete(key);
        chip.classList.add('off');
      } else {
        activeSpecies.add(key);
        chip.classList.remove('off');
      }
      refreshMarkerVisibility();
    });
    container.appendChild(chip);
  });
}
buildSpeciesFilterUI();

// --- Markers ---
function primaryColor(spot) {
  return SPECIES_INFO[spot.species[0]].color;
}

function makeIcon(color, kind) {
  if (kind === 'hump') {
    // Sunken structure gets a plain circle marker (not a "place" pin) — there's no
    // shoreline location to point at, just a spot on open water.
    return L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};
             border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  }
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};
           transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22]
  });
}

SPOTS.forEach(spot => {
  const marker = L.marker([spot.lat, spot.lon], { icon: makeIcon(primaryColor(spot), spot.kind) });
  marker.bindPopup(`<b>${spot.name}</b><br>${spot.structure}`);
  marker.on('click', (e) => {
    L.DomEvent.stopPropagation(e);
    openSpotPanel(spot);
  });
  marker.addTo(map);
  markersById[spot.id] = marker;
});

// --- Sheets ---
const reportPanel = document.getElementById('report-panel');
const spotPanel = document.getElementById('spot-panel');

function closeAllSheets() {
  reportPanel.classList.add('hidden');
  spotPanel.classList.add('hidden');
}

document.getElementById('report-toggle').addEventListener('click', () => {
  const willOpen = reportPanel.classList.contains('hidden');
  closeAllSheets();
  if (willOpen) reportPanel.classList.remove('hidden');
});

// Picks a readable text color (near-black or white) for a colored background,
// using a rough perceptual-luminance formula — good enough to decide "is this
// background light or dark" without needing full WCAG contrast math. Fixes tags
// like Perch's gold, where white text was hard to read.
function idealTextColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#12141c' : '#ffffff';
}

function openSpotPanel(spot) {
  closeAllSheets();
  const tags = spot.species.map(s => {
    const info = SPECIES_INFO[s];
    return `<span class="species-tag" style="background:${info.color};color:${idealTextColor(info.color)}">${info.label}</span>`;
  }).join('');
  let todayFitHtml = '';
  const activeFactors = window.__todayFactorsByBucket && window.__selectedBucketKey
    ? window.__todayFactorsByBucket[window.__selectedBucketKey]
    : window.__todayFactors;
  if (activeFactors) {
    const { reason } = scoreSpot(spot, activeFactors);
    const label = window.__selectedBucketKey ? `Fit — ${BUCKET_LABELS[window.__selectedBucketKey]}` : "Today's fit";
    todayFitHtml = `<p class="spot-label">${label}</p><p>${reason.charAt(0).toUpperCase()}${reason.slice(1)}.</p>`;
  }
  document.getElementById('spot-detail').innerHTML = `
    <p class="spot-title">${spot.name}</p>
    <p class="spot-structure">${spot.structure}</p>
    <div class="species-tags">${tags}</div>
    <p class="spot-label">Why this spot right now</p>
    <p>${spot.why}</p>
    <p class="spot-label">Technique</p>
    <p>${spot.technique}</p>
    <p class="spot-label">Best conditions</p>
    <p>${spot.bestConditions}</p>
    ${todayFitHtml}
  `;
  spotPanel.classList.remove('hidden');
  map.setView([spot.lat, spot.lon], Math.max(map.getZoom(), 13));
}

map.on('click', closeAllSheets);

// --- Report panel content (static from data.js) ---
// General "last shipped a change" date — separate from the "Automation last
// checked" line in the report panel below, which tracks the daily scraper.
document.getElementById('updated-label').textContent = `Updated ${LAST_UPDATED}`;

// Only show reports from the last REPORT_MAX_AGE_DAYS days — an old report showing
// up as if it were current is worse than not showing one at all. If every report on
// file is older than that (nobody's posted in a while), fall back to just the single
// most recent one so the panel isn't empty, but flag it as stale.
function daysOld(dateStr) {
  const ms = Date.now() - new Date(dateStr + 'T00:00:00').getTime();
  return ms / (1000 * 60 * 60 * 24);
}
function reportCard(report, isStale) {
  const age = Math.floor(daysOld(report.date));
  const ageLabel = age <= 0 ? 'today' : age === 1 ? '1 day ago' : `${age} days ago`;
  // Auto-scraped reports carry raw, unedited text (rawText) pulled straight from the
  // guide's own site — no AI summarizing. Older hand-curated entries (if any) carry
  // a summary + techniquesSeen list instead. Render whichever the report has.
  const body = report.techniquesSeen
    ? `<p>${report.summary}</p><ul class="techniques">${report.techniquesSeen.map(t => `<li>${t}</li>`).join('')}</ul>`
    : `<p>${report.rawText || report.summary || ''}</p>`;
  return `
    <div class="report-card">
      <h3>${report.source} <span class="muted">— ${report.date} (${ageLabel})</span></h3>
      ${isStale ? `<p class="stale-flag">No report in the last ${REPORT_MAX_AGE_DAYS} days — showing the most recent one available.</p>` : ''}
      ${report.waterTempF ? `<p>Water temp: <b>${report.waterTempF}°F</b></p>` : ''}
      ${body}
      <p class="report-source">Source: <a href="${report.sourceUrl}" target="_blank" rel="noopener">${report.source}</a>${!report.techniquesSeen ? ' <span class="muted">(auto-pulled, unedited)</span>' : ''}</p>
    </div>
  `;
}

const rawReports = typeof AUTO_REPORTS !== 'undefined' ? AUTO_REPORTS : [];
const sortedReports = [...rawReports].sort((a, b) => new Date(b.date) - new Date(a.date));
const recentReports = sortedReports.filter(r => daysOld(r.date) <= REPORT_MAX_AGE_DAYS);
let reportsHtml;
if (recentReports.length > 0) {
  reportsHtml = recentReports.map(r => reportCard(r, false)).join('');
} else if (sortedReports.length > 0) {
  reportsHtml = reportCard(sortedReports[0], true);
} else {
  reportsHtml = `<p class="muted">No fishing reports on file yet.</p>`;
}

// Historical reports (same rough week, prior years) are a supplementary signal —
// most useful when current reports are thin. Always shown, but visually secondary,
// and with extra framing when there's not much current data to go on.
function historyCard(report) {
  return `
    <div class="report-card history-card">
      <h4>${report.dateRange} <span class="muted">(${report.year})</span></h4>
      <p>Water temp: <b>${report.waterTempF}°F</b></p>
      <p>${report.summary}</p>
      <p class="report-source">Source: <a href="${report.sourceUrl}" target="_blank" rel="noopener">${report.source}</a></p>
    </div>
  `;
}
const thinData = recentReports.length < 2;
const historyIntro = thinData
  ? "Not many current reports this week, so here's what these same guides were seeing this time in past years — useful mainly if the weather's been similar."
  : "For context, here's what these same guides were seeing this same week in past years.";
const historyHtml = HISTORICAL_REPORTS.length > 0 ? `
  <div class="history-section">
    <p class="spot-label">Same week, past years</p>
    <p class="muted">${historyIntro}</p>
    ${HISTORICAL_REPORTS.map(historyCard).join('')}
  </div>
` : '';

// Proof the daily scraper actually ran, independent of whether it found anything
// new — reports.checked.js is rewritten every single run, unlike reports.auto.js
// which only changes when new content shows up. Answers "is this even working?"
// at a glance instead of leaving it ambiguous.
let checkedHtml = '';
if (typeof REPORTS_CHECKED_AT !== 'undefined') {
  const checkedDate = new Date(REPORTS_CHECKED_AT);
  const formatted = checkedDate.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
  const failed = (typeof REPORTS_CHECK_STATUS !== 'undefined' ? REPORTS_CHECK_STATUS : []).filter(s => !s.ok);
  const warn = failed.length
    ? ` — <span class="stale-flag">${failed.map(f => f.source).join(', ')} didn't respond, will retry tomorrow</span>`
    : '';
  checkedHtml = `<p class="muted" style="margin-top:10px;font-size:11.5px;">Automation last checked for new reports: ${formatted}${warn}</p>`;
}

document.getElementById('report-block').innerHTML = `
  ${reportsHtml}
  ${historyHtml}
  ${checkedHtml}
`;

// --- Weather angle: pure rule-based reasoning over the live NWS forecast, no AI ---
// involved. Applies one well-established idea (fish feed harder ahead of a front and
// go quieter behind one) plus basic wind-push logic (wind from direction X loads bait
// onto the opposite shoreline) to whatever the forecast actually says. Recomputed
// fresh every time the app loads, from live data — no daily refresh job needed for
// this part at all.
const COMPASS_DEG = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5
};
function dirToDeg(d) { return d && COMPASS_DEG[d.toUpperCase()] !== undefined ? COMPASS_DEG[d.toUpperCase()] : null; }
function angleDiff(a, b) { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
function oppositeDir(d) {
  const deg = dirToDeg(d);
  if (deg === null) return null;
  const target = (deg + 180) % 360;
  let best = null, bestDiff = 999;
  for (const [name, val] of Object.entries(COMPASS_DEG)) {
    const diff = angleDiff(val, target);
    if (diff < bestDiff) { bestDiff = diff; best = name; }
  }
  return best;
}
function maxWindMph(speedStr) {
  const nums = (speedStr.match(/\d+/g) || []).map(Number);
  return nums.length ? Math.max(...nums) : 0;
}
// Pulls the handful of "today" signals out of the live forecast that actually
// drive fish behavior in established, well-known ways: wind speed (calm vs.
// wind-blown structure), a front/pressure-instability proxy (see note below),
// and light level (bright/calm vs. overcast, from the forecast's own wording).
// One honest caveat: NWS's /forecast endpoint doesn't expose raw barometric
// pressure or numeric cloud-cover % — this infers "unsettled" from the same
// wind-shift + precipitation pattern a falling-pressure front produces, rather
// than reading a barometer directly. Good enough for the well-known rule (fish
// feed harder ahead of a front, go quiet behind one) without adding a second
// live data source.
function computeTodayFactors(periods) {
  const p0 = periods[0], p1 = periods[1], p2 = periods[2];
  const d0 = dirToDeg(p0.windDirection);
  const d2 = p2 ? dirToDeg(p2.windDirection) : null;
  const shift = (d0 !== null && d2 !== null) ? angleDiff(d0, d2) : 0;
  const precipSoon = periods.slice(0, 3).some(p => /rain|shower|thunderstorm|snow|drizzle/i.test(p.shortForecast));
  const windJump = p1 ? maxWindMph(p1.windSpeed) - maxWindMph(p0.windSpeed) : 0;
  const frontLikely = (shift >= 67 && precipSoon) || windJump >= 8;
  const windMph = maxWindMph(p0.windSpeed);
  const lowLight = /cloud|overcast|rain|shower|storm|fog|drizzle/i.test(p0.shortForecast) && !/sunny|clear/i.test(p0.shortForecast);
  const brightCalm = /sunny|clear/i.test(p0.shortForecast) && windMph < 8;
  return { p0, p1, p2, windMph, frontLikely, precipSoon, lowLight, brightCalm };
}

function computeWeatherAngle(f) {
  const { p0, p1, p2, frontLikely, precipSoon } = f;
  if (frontLikely) {
    const towardDir = (p2 || p1).windDirection;
    return `Looks like a front is moving through over the next day or so — wind swinging from ${p0.windDirection} ` +
      `toward ${towardDir}${precipSoon ? ', with rain or storms in the forecast' : ''}. Fish typically feed hardest ` +
      `in the hours right before a front arrives, so that pre-frontal window is usually the better bite — work ` +
      `wind-blown points and reef edges hard while it lasts. Expect a slower, tighter-to-structure bite for a day ` +
      `or so once it passes.`;
  }
  const opp = oppositeDir(p0.windDirection);
  return `No major frontal passage in the next few days — ${p0.windDirection} wind around ${p0.windSpeed}.` +
    (opp ? ` That wind is loading bait onto ${opp}-facing shorelines and points — worth starting there.` : '') +
    ` With stable weather, normal timing (early/late, low light) matters more than chasing a front right now.`;
}

// --- Time-of-day buckets: same rule-based scoring as above, but computed from the
// NWS *hourly* forecast (not the twice-daily Today/Tonight periods) so Morning/
// Midday/Evening/Night each get their own live wind, light, and front-timing read
// instead of all sharing one daily average. Every bucket always uses the next
// upcoming occurrence of that window — the one in progress right now if you're
// currently in it — so it stays a live look rather than replaying an old forecast.
const BUCKET_LABELS = { morning: 'Morning', midday: 'Midday', evening: 'Evening', night: 'Night' };
const LOW_LIGHT_RE = /cloud|overcast|rain|shower|storm|fog|drizzle/i;
const BRIGHT_RE = /sunny|clear/i;

function classifyHour(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'midday';
  if (hour >= 16 && hour < 20) return 'evening';
  return 'night';
}
function currentBucketKey() {
  return classifyHour(new Date().getHours());
}
// A Night bucket spans 8pm-5am, crossing midnight — key its pre- and post-midnight
// hours to the same group by rolling hours before 5am back to the previous date.
function bucketGroupDate(date) {
  const d = new Date(date);
  if (d.getHours() < 5) d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
// Scans hour-by-hour wind direction for a sustained >=67° shift (held for 2+ hours
// after it starts, to ignore noise) and returns when it begins — a more precise
// version of the shift check computeTodayFactors does with only Today/Tonight/Tomorrow.
function detectFrontShift(hourly) {
  if (!hourly.length) return null;
  const baseDeg = dirToDeg(hourly[0].windDirection);
  if (baseDeg === null) return null;
  for (let i = 1; i < hourly.length - 2; i++) {
    const deg = dirToDeg(hourly[i].windDirection);
    const deg2 = dirToDeg(hourly[i + 1] && hourly[i + 1].windDirection);
    const deg3 = dirToDeg(hourly[i + 2] && hourly[i + 2].windDirection);
    if (deg === null || deg2 === null || deg3 === null) continue;
    if (angleDiff(deg, baseDeg) >= 67 && angleDiff(deg2, baseDeg) >= 50 && angleDiff(deg3, baseDeg) >= 50) {
      return new Date(hourly[i].startTime);
    }
  }
  return null;
}
function buildHourlyBuckets(hourly) {
  const now = new Date();
  const next48 = hourly.filter(h => new Date(h.endTime || h.startTime) > now).slice(0, 48);
  if (!next48.length) return null;

  const groups = {}; // "dateMs|bucket" -> hour entries
  next48.forEach(h => {
    const start = new Date(h.startTime);
    const bucket = classifyHour(start.getHours());
    const key = `${bucketGroupDate(start)}|${bucket}`;
    (groups[key] = groups[key] || []).push(h);
  });

  const shiftDate = detectFrontShift(next48);
  const next24 = next48.slice(0, 24);
  const precipSoon = next24.some(h => /rain|shower|thunderstorm|snow|drizzle/i.test(h.shortForecast));
  const windJump = Math.max(...next24.map(h => maxWindMph(h.windSpeed))) - maxWindMph(next48[0].windSpeed);
  const frontLikelyGlobal = (shiftDate && precipSoon) || windJump >= 8;

  const result = {};
  Object.keys(BUCKET_LABELS).forEach(bucket => {
    const key = Object.keys(groups).filter(k => k.endsWith(`|${bucket}`)).sort()[0];
    if (!key) { result[bucket] = null; return; }
    const hours = groups[key];
    const windMph = Math.round(hours.reduce((sum, h) => sum + maxWindMph(h.windSpeed), 0) / hours.length);
    const anyLowLightText = hours.some(h => LOW_LIGHT_RE.test(h.shortForecast));
    const anyBrightText = hours.some(h => BRIGHT_RE.test(h.shortForecast));
    const lowLight = bucket !== 'midday' || anyLowLightText;
    const brightCalm = bucket === 'midday' && anyBrightText && !anyLowLightText && windMph < 8;
    const bucketStart = new Date(hours[0].startTime);
    const bucketEnd = new Date(hours[hours.length - 1].endTime || hours[hours.length - 1].startTime);
    const dayLabel = bucketGroupDate(bucketStart) === bucketGroupDate(now) ? 'Today' : 'Tomorrow';
    const timeFmt = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric' });
    result[bucket] = {
      windMph, precipSoon, lowLight, brightCalm,
      frontLikely: frontLikelyGlobal && (!shiftDate || bucketStart < shiftDate),
      rangeLabel: `${dayLabel}, ${timeFmt(bucketStart)}–${timeFmt(bucketEnd)}`
    };
  });
  if (!result.morning || !result.midday || !result.evening || !result.night) return null;
  return result;
}

// Scores how well each spot's structure type fits *today's* conditions, using
// the same well-established ideas as the weather angle above: sheltered bays
// beat rough open water when it's windy; points/current seams/humps come alive
// with a wind-blown chop; overcast keeps fish shallow and active (good for
// bays and muskie); bright and calm pushes fish deep and tight (good for
// humps). This is deliberately simple, transparent rule-based scoring — not a
// black box — so "why is this spot ranked here today" always has a one-line
// answer.
function scoreSpot(spot, f) {
  let score = 50;
  let reason = null;
  const isBay = spot.kind === 'bay';
  const isPoint = spot.kind === 'point';
  const isCurrent = spot.kind === 'current';
  const isHump = spot.kind === 'hump';
  const setReason = (r) => { if (!reason) reason = r; };

  if (f.frontLikely && (isPoint || isCurrent || isHump)) {
    score += 20;
    setReason("pre-frontal window — active fish should be using this structure hard right now");
  }

  if (f.windMph >= 8 && f.windMph <= 20) {
    if (isPoint || isCurrent) { score += 18; setReason('wind-blown today — bait is loading up against this structure'); }
    else if (isHump) { score += 8; setReason('light-to-moderate chop over the top, better than dead calm here'); }
  } else if (f.windMph > 20) {
    if (isBay) { score += 15; setReason('sheltered water while the main lake is rough today'); }
    else if (isPoint || isHump) { score -= 10; setReason('exposed to today\'s wind — tough boat control, lower priority today'); }
  } else if (f.windMph < 5) {
    if (isHump) { score -= 8; setReason('dead calm today, which tends to shut down open-water structure'); }
    else if (isBay) { score += 5; }
  }

  if (f.lowLight) {
    if (isBay) { score += 12; setReason("today's overcast keeps fish shallow and active here"); }
    else if (isHump) { score += 6; }
    if (spot.species.includes('muskie')) { score += 5; }
  } else if (f.brightCalm) {
    if (isHump) { score += 12; setReason("bright, calm skies today push fish to deeper structure like this"); }
    else if (isBay) { score -= 6; }
    if (spot.species.includes('muskie')) { score += 4; setReason('good bright-light window for muskie sight-feeding'); }
  }

  return { score, reason: reason || 'solid all-around structure regardless of today\'s specific conditions' };
}

// Renders the ranked picks list. Pass a buckets object (from buildHourlyBuckets) plus
// a selected bucket key to get the time-of-day toggle; pass a single daily factors
// object (from computeTodayFactors) to fall back to one plain "today" ranking when
// the hourly forecast couldn't be loaded.
function renderTodaysPicks(input, selectedKey) {
  const isBuckets = !!(input && input.morning && input.midday && input.evening && input.night);
  const buckets = isBuckets ? input : null;
  const activeKey = isBuckets ? (selectedKey || currentBucketKey()) : null;
  const factors = isBuckets ? buckets[activeKey] : input;

  const scored = SPOTS.map(spot => ({ spot, ...scoreSpot(spot, factors) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  const toggleHtml = isBuckets ? `
    <div class="time-toggle">
      ${Object.keys(BUCKET_LABELS).map(k => `
        <button class="time-pill${k === activeKey ? ' active' : ''}" data-bucket="${k}">${BUCKET_LABELS[k]}</button>
      `).join('')}
    </div>
    <p class="muted" style="font-size:11px;margin-top:6px;">${buckets[activeKey].rangeLabel}</p>
  ` : '';

  const html = `
    <p class="spot-label" style="margin-top:14px;">${isBuckets ? 'Top picks by time of day' : "Today's top picks"}</p>
    <p class="muted" style="font-size:11.5px;">${isBuckets
      ? 'Ranked live from the hourly NWS forecast for each window — pick a time of day to see the recommendation shift.'
      : "Ranked live from today's wind and light — same rule-based logic as the weather angle above, no AI, recomputed every time you open the app."}</p>
    ${toggleHtml}
    <div class="picks-list">
      ${top.map(({ spot, reason }) => `
        <button class="pick-item" data-spot-id="${spot.id}">
          <span class="pick-dot" style="background:${primaryColor(spot)}"></span>
          <span class="pick-text"><b>${spot.name}</b><br><span class="muted">${reason}</span></span>
        </button>
      `).join('')}
    </div>
  `;

  // Replace any previously rendered picks block instead of stacking a new one below
  // it — needed both for re-loads and for switching time-of-day pills in place.
  const existing = document.getElementById('todays-picks-block');
  if (existing) existing.remove();
  const wrapper = document.createElement('div');
  wrapper.id = 'todays-picks-block';
  wrapper.innerHTML = html;
  document.getElementById('weather-block').appendChild(wrapper);

  if (isBuckets) {
    window.__todayFactorsByBucket = buckets;
    window.__selectedBucketKey = activeKey;
    wrapper.querySelectorAll('.time-pill').forEach(btn => {
      btn.addEventListener('click', () => renderTodaysPicks(buckets, btn.dataset.bucket));
    });
  } else {
    window.__todayFactors = factors;
  }

  wrapper.querySelectorAll('.pick-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const spot = SPOTS.find(s => s.id === btn.dataset.spotId);
      if (spot) openSpotPanel(spot);
    });
  });
}

// --- Live weather from National Weather Service (api.weather.gov), no key required ---
async function loadWeather() {
  const { gridId, gridX, gridY } = LAKE.weatherPoint;
  const block = document.getElementById('weather-block');
  try {
    const res = await fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`);
    if (!res.ok) throw new Error('forecast fetch failed');
    const json = await res.json();
    const periods = json.properties.periods.slice(0, 6);
    const now = periods[0];
    const factors = computeTodayFactors(periods);
    block.innerHTML = `
      <div class="wx-now">
        <span class="temp">${now.temperature}°${now.temperatureUnit}</span>
        <span class="desc">${now.shortForecast} · Wind ${now.windSpeed} ${now.windDirection}</span>
      </div>
      <div class="wx-grid">
        ${periods.map(p => `
          <div class="wx-period">
            <div class="name">${p.name}</div>
            <div class="t">${p.temperature}°</div>
            <div>${p.shortForecast}</div>
            <div class="muted">${p.windSpeed} ${p.windDirection}</div>
          </div>
        `).join('')}
      </div>
      <p class="muted" style="margin-top:8px;font-size:11.5px;">Live forecast: National Weather Service (api.weather.gov), Duluth office.</p>
      <p class="spot-label">Weather angle</p>
      <p>${computeWeatherAngle(factors)}</p>
    `;

    // Hourly forecast powers the Morning/Midday/Evening/Night picks below — a
    // separate, more granular NWS endpoint than the twice-daily one above. If it
    // fails for any reason, fall back to one plain "today" ranking instead of
    // showing a broken or empty picks section.
    let buckets = null;
    try {
      const hourlyRes = await fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast/hourly`);
      if (hourlyRes.ok) {
        const hourlyJson = await hourlyRes.json();
        buckets = buildHourlyBuckets(hourlyJson.properties.periods);
      }
    } catch (hourlyErr) {
      console.error('Hourly forecast failed', hourlyErr);
    }
    renderTodaysPicks(buckets || factors, buckets ? currentBucketKey() : undefined);
  } catch (err) {
    block.innerHTML = `<p class="muted">Couldn't load live weather (offline or NWS unreachable). Check conditions manually before heading out.</p>`;
  }
}
loadWeather();

// --- PWA service worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
