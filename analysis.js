// Season, pressure and guide-report analysis for the spot recommendations.
// Everything here is plain rule-based logic (no AI) and has no DOM dependencies, so
// it can be unit-tested (see tests.html). app.js feeds the results into scoreSpot.
//
// Honest caveat baked into the wording: these are general northern-MN patterns for
// each water-temperature phase, not guarantees. Reports from real guides on the
// water always beat a rule of thumb.

// --- Water temperature -------------------------------------------------------
// Typical surface temperature (°F) for Lake Vermilion by day of year. Used only when
// no recent guide report gives a real number. Piecewise-linear between these points.
const WATER_TEMP_CLIMATOLOGY = [
  ['01-01', 33], ['03-15', 33], ['04-25', 38], ['05-10', 47], ['05-25', 54], ['06-10', 62],
  ['06-25', 68], ['07-15', 74], ['08-05', 75], ['08-25', 71], ['09-10', 65], ['09-25', 58],
  ['10-10', 51], ['10-25', 45], ['11-10', 40], ['11-25', 35], ['12-31', 33]
];

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}
function mdToDoy(md, year) {
  const [m, d] = md.split('-').map(Number);
  return dayOfYear(new Date(year, m - 1, d));
}
function climatologyWaterTemp(date) {
  const doy = dayOfYear(date), y = date.getFullYear();
  const pts = WATER_TEMP_CLIMATOLOGY.map(([md, t]) => [mdToDoy(md, y), t]);
  for (let i = 1; i < pts.length; i++) {
    if (doy <= pts[i][0]) {
      const [d0, t0] = pts[i - 1], [d1, t1] = pts[i];
      return t0 + (t1 - t0) * ((doy - d0) / Math.max(1, d1 - d0));
    }
  }
  return pts[pts.length - 1][1];
}
// Guides report water temp as a range string like "66–70" (see the scraper).
function parseTempRange(str) {
  const m = String(str || '').match(/(\d{2})\s*[–-]\s*(\d{2})/);
  return m ? (Number(m[1]) + Number(m[2])) / 2 : null;
}
// Prefers a real guide-reported temperature from the last 10 days; otherwise falls
// back to the seasonal norm and says so.
function estimateWaterTemp(reports, date) {
  const recent = (reports || [])
    .map(r => ({ t: parseTempRange(r.waterTempF), age: (date - new Date(r.date + 'T12:00:00')) / 86400000 }))
    .filter(r => r.t !== null && r.age >= -1 && r.age <= 10)
    .sort((a, b) => a.age - b.age);
  if (recent.length) return { tempF: Math.round(recent[0].t), source: 'guide report' };
  return { tempF: Math.round(climatologyWaterTemp(date)), source: 'seasonal average' };
}

// --- Season phase ------------------------------------------------------------
// depth: target depth range (ft) by species for that phase. kindBonus: score nudge by
// spot kind. Cooling vs warming matters (a 55°F lake in May is not a 55°F lake in
// October), so phase depends on the direction of the season.
const PHASES = {
  'ice-out': {
    label: 'Ice-out / cold water', blurb: 'Cold water; fish are sluggish and hold near the warmest, shallowest water they can find.',
    depth: { walleye: [4, 12], perch: [3, 10], muskie: [3, 10], smallmouth: [8, 16], crappie: [3, 8] },
    kindBonus: { bay: 8, current: 4 },
    look: ["Water is in the 30s and low 40s; ice-out or right after.", "Fish sluggish, bites are light taps."],
    adjust: ["Fish the warmest shallow water: dark-bottom bays and afternoon sun.", "Slow down: small jigs and minnows, long pauses."],
    next: "Spring spawn begins around 40–50°F."
  },
  'spring-spawn': {
    label: 'Spring spawn', blurb: 'Walleye and perch stage on rock, gravel and current; fish are shallow and predictable.',
    depth: { walleye: [3, 12], perch: [2, 8], muskie: [3, 10], smallmouth: [6, 14], crappie: [2, 8] },
    kindBonus: { current: 10, bay: 6 },
    look: ["Water 40–50°F; walleye and perch on rock, gravel and current.", "Fish concentrated and predictable."],
    adjust: ["Work the river outlet and shallow rock at night and low light.", "Jig and minnow; keep fish handling gentle (protect spawners)."],
    next: "Post-spawn once water passes ~50°F."
  },
  'post-spawn': {
    label: 'Post-spawn', blurb: 'Fish recover and start spreading to the first breaks and weed edges.',
    depth: { walleye: [8, 18], perch: [6, 14], muskie: [4, 12], smallmouth: [6, 16], crappie: [5, 12] },
    kindBonus: { bay: 5, point: 4 },
    look: ["Water 50–60°F; fish leaving spawning areas.", "Bites can be picky for a week or two."],
    adjust: ["Move out to the first break and weed edges.", "Slip bobbers and jigs with live bait, then start trolling."],
    next: "Early summer at ~60°F."
  },
  'early-summer': {
    label: 'Early summer', blurb: 'Weeds are up and baitfish are shallow; fish spread across weed edges, points and reefs.',
    depth: { walleye: [10, 20], perch: [8, 16], muskie: [4, 14], smallmouth: [8, 18], crappie: [6, 14] },
    kindBonus: { point: 5, hump: 4 },
    look: ["Water 60–68°F; weeds up, baitfish shallow.", "Fish spread out along weed edges, points and reefs."],
    adjust: ["Match the hatch on shallow structure at low light.", "Try crankbaits and spinners as well as live bait."],
    next: "Summer patterns above ~68°F."
  },
  'summer': {
    label: 'Summer', blurb: 'Warm surface water. Fish hold on deeper structure and mud basins by day and push shallow at low light.',
    depth: { walleye: [15, 32], perch: [10, 20], muskie: [6, 16], smallmouth: [10, 22], crappie: [8, 18] },
    kindBonus: { hump: 6, point: 3 },
    look: ["Water 68°F+; fish stratified, deeper by day.", "Best action at dawn, dusk and night."],
    adjust: ["Fish deeper structure and mud basins mid-day, shallow at low light.", "Lead-core and crawler rigs on basins."],
    next: "Early fall when the lake cools below ~68°F."
  },
  'early-fall': {
    label: 'Early fall (cooling, pre-turnover)', blurb: 'Water is cooling but still stratified. Walleye sit on transitions, rock and mud flats; fish begin to move shallower at low light.',
    depth: { walleye: [12, 28], perch: [10, 20], muskie: [6, 18], smallmouth: [8, 20], crappie: [8, 16] },
    kindBonus: { current: 5, point: 4, hump: 3 },
    look: ["Surface 55–68°F and slowly dropping.", "Weeds dying back; fall colors starting.", "Sonar still shows fish on transitions, rock and mud flats."],
    adjust: ["Stay with the current pattern: transitions and flats, 12–28 ft.", "Watch the temperature — falling below ~55°F means turnover is near.", "Get your last good stable-weather days now."],
    next: "Turnover begins around 47–55°F."
  },
  'turnover': {
    label: 'Fall turnover', blurb: 'Surface water is mixing with deep water. Bites can be erratic; fish often relate to wind-blown points and shallower rock, and muskie feed heavily.',
    depth: { walleye: [8, 20], perch: [10, 20], muskie: [6, 20], smallmouth: [15, 30], crappie: [8, 16] },
    kindBonus: { point: 8, current: 5, bay: -2 },
    look: ["Surface roughly 47–55°F and about the same temperature top to bottom (temp at depth ≈ surface).", "Cloudy or greenish water, foam or debris on windy shores, a fishy or algae smell.", "Fish scattered: sudden dead spots on flats that were producing, suspended fish, few marks.", "Bites erratic, with short windows."],
    adjust: ["Cover water: troll or drift to find active fish instead of sitting on one spot.", "Move shallower and to wind-blown points and rock, 8–20 ft, especially at low light.", "Downsize and slow down: smaller jigs, minnows, less flash.", "Muskie: feed heavily now, so throw big baits on points and weed edges.", "Be patient. Bites usually settle in one to two weeks as the water clears."],
    next: "Late fall patterns below ~47°F."
  },
  'late-fall': {
    label: 'Late fall (cold water)', blurb: 'Cold, clear water. Fish slow down and hold on deeper breaks; the best bites are short and at low light. Downsize and slow down.',
    depth: { walleye: [10, 30], perch: [15, 30], muskie: [8, 25], smallmouth: [25, 40], crappie: [10, 20] },
    kindBonus: { hump: 5, point: 4, bay: -4 },
    look: ["Surface under ~47°F and falling; water clear again.", "Fish stacked on deep breaks and basin edges.", "Bites are short and at low light."],
    adjust: ["Fish deeper breaks, 10–30 ft: vertical jigging, minnows and spoons.", "Downsize; slow everything down.", "Night walleye on shallow rock; fish the warmest part of the afternoon."],
    next: "Winter approaches near 35°F."
  }
};

function seasonPhase(date, waterTempF) {
  const cooling = dayOfYear(date) > mdToDoy('08-05', date.getFullYear()) && dayOfYear(date) < mdToDoy('12-31', date.getFullYear()) + 1;
  const t = waterTempF;
  let key;
  if (cooling) {
    key = t >= 68 ? 'summer' : t >= 55 ? 'early-fall' : t >= 47 ? 'turnover' : 'late-fall';
  } else {
    key = t < 40 ? 'ice-out' : t < 50 ? 'spring-spawn' : t < 60 ? 'post-spawn' : t < 68 ? 'early-summer' : 'summer';
  }
  return { key, ...PHASES[key] };
}

// --- Barometric pressure trend ----------------------------------------------
// obs: NWS station observation features (api.weather.gov/stations/<id>/observations),
// newest first. Pressure comes in Pa; work in hPa (mb).
function pressureTrend(features) {
  const pts = (features || [])
    .map(f => ({ t: new Date(f.properties.timestamp).getTime(), p: f.properties.barometricPressure && f.properties.barometricPressure.value }))
    .filter(x => x.p != null && !isNaN(x.t))
    .map(x => ({ t: x.t, hpa: x.p / 100 }))
    .sort((a, b) => b.t - a.t);
  if (pts.length < 4) return null;
  const now = pts[0];
  const at = (hoursAgo) => {
    const target = now.t - hoursAgo * 3600000;
    return pts.reduce((best, x) => Math.abs(x.t - target) < Math.abs(best.t - target) ? x : best, pts[0]);
  };
  const p3 = at(3), p6 = at(6), p12 = at(12);
  const spanH = (now.t - pts[pts.length - 1].t) / 3600000;
  const d3 = now.hpa - p3.hpa, d6 = now.hpa - p6.hpa, d12 = spanH >= 9 ? now.hpa - p12.hpa : null;
  let label = 'steady';
  if (d3 <= -1.0 || d6 <= -2.0) label = 'falling';
  else if (d3 >= 1.0 || d6 >= 2.0) label = 'rising';
  const high = now.hpa >= 1018, low = now.hpa <= 1008;
  return { hpa: Math.round(now.hpa * 10) / 10, d3: Math.round(d3 * 10) / 10, d6: Math.round(d6 * 10) / 10, d12: d12 == null ? null : Math.round(d12 * 10) / 10, label, high, low };
}

// --- What the guides are reporting ------------------------------------------
const TECHNIQUE_WORDS = {
  'lindy rig / live-bait rig': /lindy|live[- ]bait rig|rigging/i,
  'jigging': /\bjig(s|ging)?\b/i,
  'crankbaits': /crank ?bait|crankbait/i,
  'lead-core trolling': /lead ?core|leadcore/i,
  'slip bobber': /slip[- ]?bobber/i,
  'trolling': /\btroll(ing)?\b/i,
  'leeches': /leech/i,
  'crawlers': /crawler/i,
  'minnows': /minnow/i,
  'spinner rigs': /spinner/i
};
function parseReportSignals(reports, date, maxAgeDays) {
  const recent = (reports || []).filter(r => {
    const age = (date - new Date(r.date + 'T12:00:00')) / 86400000;
    return age <= maxAgeDays && age >= -1;
  });
  const ranges = [];
  const techniques = {};
  for (const r of recent) {
    const text = String(r.rawText || r.summary || '').replace(/&#8211;|&ndash;/g, '–').replace(/’|&#8217;/g, "'");
    // "12 to 25 feet", "18-24 ft", "12–15 ft", "28–34'" ...
    for (const m of text.matchAll(/(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*(?:ft\b|feet\b|foot\b|')/gi)) {
      const lo = +m[1], hi = +m[2];
      if (lo < hi && hi <= 60) ranges.push([lo, hi]);
    }
    // "30'+" style
    for (const m of text.matchAll(/(\d{2})\s*'\s*\+/g)) ranges.push([+m[1], +m[1] + 8]);
    for (const [name, re] of Object.entries(TECHNIQUE_WORDS)) if (re.test(text)) techniques[name] = (techniques[name] || 0) + 1;
  }
  let hot = null;
  if (ranges.length) {
    // Median, not mean, so one outlier ("30'+" deep-water mention) doesn't drag it.
    const med = (arr) => { const v = [...arr].sort((x, y) => x - y); const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
    hot = [Math.round(med(ranges.map(r => r[0]))), Math.round(med(ranges.map(r => r[1])))];
  }
  const topTech = Object.entries(techniques).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 4);
  return { hotDepth: hot, rangeCount: ranges.length, techniques: topTech, reportCount: recent.length };
}

// --- Spot-level helpers ------------------------------------------------------
// Fraction (0–1) of the spot's fishable depth range that falls inside the target.
function depthOverlap(spotRange, target) {
  if (!spotRange || !target) return null;
  const lo = Math.max(spotRange[0], target[0]), hi = Math.min(spotRange[1], target[1]);
  if (hi <= lo) return 0;
  return (hi - lo) / Math.max(1, spotRange[1] - spotRange[0]);
}

// One-line seasonal read for a spot: what the phase says about each species it holds.
function seasonAdviceForSpot(spot, phase) {
  if (!phase || !spot.depth) return null;
  const parts = spot.species.map(sp => {
    const target = phase.depth[sp];
    if (!target) return null;
    const ov = depthOverlap(spot.depth, target);
    const fit = ov >= 0.6 ? 'lines up well' : ov > 0 ? 'partly overlaps' : 'is outside';
    return `${sp} target ${target[0]}–${target[1]} ft — this spot (${spot.depth[0]}–${spot.depth[1]} ft) ${fit}`;
  }).filter(Boolean);
  return parts.length ? { phaseLabel: phase.label, blurb: phase.blurb, parts } : null;
}
