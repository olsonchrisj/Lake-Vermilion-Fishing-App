// Lake Vermilion Fishing App

const map = L.map('map', { zoomControl: false, attributionControl: true });
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

function openSpotPanel(spot) {
  closeAllSheets();
  const tags = spot.species.map(s =>
    `<span class="species-tag" style="background:${SPECIES_INFO[s].color}">${SPECIES_INFO[s].label}</span>`
  ).join('');
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
  `;
  spotPanel.classList.remove('hidden');
  map.setView([spot.lat, spot.lon], Math.max(map.getZoom(), 13));
}

map.on('click', closeAllSheets);

// --- Report panel content (static from data.js) ---
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

document.getElementById('report-block').innerHTML = `
  ${reportsHtml}
  ${historyHtml}
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
function computeWeatherAngle(periods) {
  const p0 = periods[0], p1 = periods[1], p2 = periods[2];
  const d0 = dirToDeg(p0.windDirection);
  const d2 = p2 ? dirToDeg(p2.windDirection) : null;
  const shift = (d0 !== null && d2 !== null) ? angleDiff(d0, d2) : 0;
  const precipSoon = periods.slice(0, 3).some(p => /rain|shower|thunderstorm|snow|drizzle/i.test(p.shortForecast));
  const windJump = p1 ? maxWindMph(p1.windSpeed) - maxWindMph(p0.windSpeed) : 0;
  const frontLikely = (shift >= 67 && precipSoon) || windJump >= 8;

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
      <p>${computeWeatherAngle(periods)}</p>
    `;
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
