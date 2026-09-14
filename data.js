// Lake Vermilion Fishing App — data file
// Refresh this file whenever new fishing reports come in or conditions change.
// LAST_UPDATED is shown in the app header so you know how fresh this is.

const LAKE = {
  name: "Lake Vermilion",
  dow: "69-0378",
  center: [47.8791, -92.4634],
  bounds: [
    [47.7916, -92.6734], // SW
    [47.9666, -92.1650]  // NE
  ],
  weatherPoint: { lat: 47.8791, lon: -92.4634, gridId: "DLH", gridX: 78, gridY: 121 }
};

const LAST_UPDATED = "2026-09-14";

// Reports used to be hand-typed here. They're now pulled automatically — see
// reports.auto.js, regenerated daily by a GitHub Actions workflow
// (.github/workflows/refresh-reports.yml) that scrapes Patriot Guide Service and
// Fishing with Z directly, no AI involved. That file defines AUTO_REPORTS; app.js
// falls back to an empty list if it hasn't loaded (e.g. before the first run).
// The app only shows reports dated within the last REPORT_MAX_AGE_DAYS days —
// older ones are automatically hidden rather than shown as if current.
const REPORT_MAX_AGE_DAYS = 14;

// Same-week reports from prior years, used as a supplementary signal when current
// reports are thin — same guide sources, same rough calendar week, on the logic
// that fish patterning repeats fairly reliably year to year given similar weather.
// These are always shown, but clearly labeled as history, not current conditions —
// they don't get pulled into the "why this spot right now" reasoning for pins.
const HISTORICAL_REPORTS = [
  {
    year: 2025,
    dateRange: "Sept 2–8, 2025",
    source: "Fishing with Z (Zach Hrvol)",
    sourceUrl: "https://fishingwithz.com/september-2-8-2025/",
    waterTempF: "60–64",
    summary:
      "A big weather swing came through and made things tricky, but long trolling runs (not repeating " +
      "water) and jigging both produced. Jig fish came from transitions, shallow rock, deep rock, and " +
      "deep holes — spread across structure types rather than one pattern. Guide expected the bite to " +
      "pick up as fall weather settled in behind the front."
  },
  {
    year: 2024,
    dateRange: "Sept 3–9, 2024",
    source: "Fishing with Z (Zach Hrvol)",
    sourceUrl: "https://fishingwithz.com/september-3-9-2024/",
    waterTempF: "66–70",
    summary:
      "A cold front came through but didn't slow the bite much. Leadcore on mud flats was still the go-to, " +
      "focused on 18–24 ft with an expectation that fish would push to the deeper 26–32 ft flats as fall " +
      "progressed. Consistent fishing, sorting through smaller fish to find 14\"+ keepers."
  }
];

// The weather angle used to be a hand-written paragraph here. It's now computed
// live from the NWS forecast every time the app loads — see computeWeatherAngle()
// in app.js.

// Recommended spots. Two kinds:
//  - "bay"/"point"/"current" spots are real named locations (from OpenStreetMap/USGS naming),
//    coordinates are the approximate center of the named area, not an exact boat waypoint.
//  - "hump" spots were identified directly from the MN DNR's bathymetric contour data: an
//    isolated, closed depth contour ring with a compact footprint (roughly 90–280 ft across),
//    meaning shallower water surrounded by deeper water on all sides — classic sunken
//    structure. These are real surveyed contours, not guesses, but the 1958-era DNR survey
//    (5 ft contour interval) isn't sonar-precise, so treat the coordinate as "in this
//    neighborhood" and use your electronics to pinpoint the actual top of the structure.
const SPOTS = [
  {
    id: "niles-basin",
    name: "Niles Bay deep mud basin",
    lat: 47.9238, lon: -92.5129,
    kind: "bay",
    species: ["walleye"],
    structure: "Deep mud/basin flat",
    why:
      "Matches the current report's #1 pattern: walleye schools roaming deep mud on the south/central " +
      "end of the lake, easily marked on electronics. Good pick when wind makes reef fishing uncomfortable.",
    technique: "Lead-core trolling, 2.0–2.5 mph, 28–34 ft. Spinner/crankbait behind lead core.",
    bestConditions: "Stable or falling barometer, light wind, overcast — fish sit up off bottom and roam."
  },
  {
    id: "oak-narrows",
    name: "Oak Narrows",
    lat: 47.9104, lon: -92.4734,
    kind: "current",
    species: ["walleye", "smallmouth"],
    structure: "Current-swept narrows, rock/sand transition",
    why:
      "Narrows between basins concentrate baitfish and create current edges. Classic sand-to-rock " +
      "transition zone the current report specifically calls out as productive.",
    technique: "Jig and crawler, 8–16 ft, working the transition line slowly. Cast crankbaits for smallmouth on the rock side.",
    bestConditions: "Any wind that pushes current through the narrows; early morning and dusk for smallmouth."
  },
  {
    id: "big-bay-reefs",
    name: "Big Bay rock reefs",
    lat: 47.8474, lon: -92.3624,
    kind: "bay",
    species: ["walleye", "smallmouth"],
    structure: "Mid-lake rock reefs, 12–18 ft",
    why:
      "Big Bay is loaded with scattered rock humps and reefs. Report notes the best walleye bite is on " +
      "reef sides in 12–15 ft — this bay has the highest concentration of that structure type on the lake.",
    technique: "Slip-bobber with jumbo leech on the reef edge, 12–15 ft. Follow up with a jig-plastic for smallmouth on the rock crown.",
    bestConditions: "Light chop preferred over dead calm — keeps fish shallower and biting on the reef."
  },
  {
    id: "stuntz-bay",
    name: "Stuntz Bay weed points",
    lat: 47.8310, lon: -92.2424,
    kind: "bay",
    species: ["walleye", "perch", "crappie"],
    structure: "Weed points and inside turns, 8–15 ft; bullrush edges in the shallower pockets",
    why:
      "Sheltered bay on the east end with classic weed-edge points and inside turns — the secondary pattern " +
      "in the current report, and a good calm-water backup when the main lake is too rough to fish reefs. " +
      "Crappie on Vermilion are known for running big but sparse, and guides point to bullrushes (\"pencil " +
      "reeds\") on south-facing main-lake shorelines as the tell — this bay has that cover.",
    technique: "Slip-bobber with leech, minnow, or crawler at points and inside turns, 8–15 ft. For crappie: small jig or minnow under a slip-bobber right along the bullrush edge, 6–10 ft.",
    bestConditions: "Windy days on the main lake — this bay stays fishable when Big Bay doesn't."
  },
  {
    id: "black-bay",
    name: "Black Bay",
    lat: 47.9613, lon: -92.5854,
    kind: "bay",
    species: ["muskie", "walleye", "crappie"],
    structure: "Weedy shallow bay, warm shallows, reed/bullrush pockets",
    why:
      "Warm, weedy, sheltered bay on the north end — the type of water muskies use to rest and feed through " +
      "the day this time of year, with walleye working the same weed edges morning and evening. The reed " +
      "pockets tucked in here fit the same bullrush pattern that holds crappie elsewhere on the lake, and " +
      "it's far enough from the named east-end bays to see less crappie pressure.",
    technique: "Muskie: large bucktails or glide baits over and along weed edges midday. Walleye: crawler harness or leech on the weedline morning/evening. Crappie: small jig/tube under a slip-bobber in the reed pockets, 6–10 ft.",
    bestConditions: "Stable warm stretch, higher sun for muskie sight-feeding."
  },
  {
    id: "wakemup-bay",
    name: "Wakemup Bay",
    lat: 47.9139, lon: -92.6207,
    kind: "bay",
    species: ["walleye", "smallmouth"],
    structure: "Rock/sand shoreline break, west-end basin",
    why:
      "West-end basin with rock-sand shoreline structure similar to what's producing lake-wide right now, " +
      "and it gets less fishing pressure than the more popular east-end water.",
    technique: "Jig and crawler along the sand-to-rock break, 8–16 ft.",
    bestConditions: "Same pattern as Oak Narrows — good alternate when that spot is crowded."
  },

  // --- Named points / bays / current seams added for wider coverage ---
  {
    id: "everett-bay",
    name: "Everett Bay",
    lat: 47.8332, lon: -92.3486,
    kind: "bay",
    species: ["walleye", "perch", "crappie"],
    structure: "Sheltered bay, public access, weed/sand mix with reed edges",
    why:
      "East-end bay between Big Bay and Stuntz Bay — same sand/weed mix that's producing lake-wide, and " +
      "it's a low-pressure option most weeks since it's smaller and less talked-about than its neighbors. " +
      "It sits on a south-facing stretch of the main lake with reed cover, matching the classic Vermilion " +
      "crappie tell — worth a look before the fall push toward deeper weed edges gets underway.",
    technique: "Jig and crawler on the sand-to-weed edge, 8–14 ft. For crappie: small jig or minnow under a slip-bobber along the reed edge, 6–10 ft.",
    bestConditions: "Good backup when Big Bay is crowded or blown out."
  },
  {
    id: "muskego-point",
    name: "Muskego Point",
    lat: 47.9027, lon: -92.5510,
    kind: "point",
    species: ["muskie", "smallmouth"],
    structure: "Main-lake point, deep water close to shore",
    why:
      "Classic ambush point — deep water swings in close, current and wind wrap around the tip and stack " +
      "baitfish there. With tonight's wind swinging S then W, the north and east sides of the point will " +
      "load up with wind-blown bait first.",
    technique: "Cast bucktails/glidebaits or jerkbaits right along the point's edge, working the wind-facing side first.",
    bestConditions: "Wind hitting the point head-on; low light morning/evening for muskie, midday sun still worth a pass."
  },
  {
    id: "vermilion-dam-rapids",
    name: "Vermilion Dam Rapids (river outlet)",
    lat: 47.9619, lon: -92.4754,
    kind: "current",
    species: ["walleye", "smallmouth"],
    structure: "Current seam at the lake's outlet into the Vermilion River",
    why:
      "Any moving-water seam concentrates baitfish and predators relative to the rest of the lake. Worth a " +
      "look especially post-frontal Tuesday when fish pull tighter to reliable current/structure.",
    technique: "Jig-minnow or 3-way rig worked slowly through the current seam.",
    bestConditions: "Stable-to-falling water levels; fish it slow, current areas get pounded so don't rush through."
  },

  // --- Sunken humps identified from MN DNR bathymetric contour data ---
  // Each of these is a real closed depth-contour ring (isolated shallower structure
  // surrounded by deeper water) pulled directly from the DNR's bathymetry service —
  // not a guess. Size and depth noted are from that contour geometry.
  {
    id: "hump-everett-open",
    name: "Open-water hump, Big Bay–Everett Bay gap",
    lat: 47.8429, lon: -92.3036,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~275 ft across, tops out near 20 ft",
    why:
      "DNR contour data shows a compact, closed 20-ft depth ring here with no shoreline nearby — a true " +
      "sunken hump sitting in open water between Big Bay and Everett Bay. This is exactly the kind of " +
      "suspended structure the current report describes fish using instead of shallow rock right now.",
    technique: "Vertical jig or slow-troll a spinner over the top and down the break; idle over it first to mark fish/find the exact crown with electronics.",
    bestConditions: "Stable or falling pressure, light-to-moderate chop — this evening's pre-frontal window fits well."
  },
  {
    id: "hump-stuntz-north",
    name: "Hump north of Stuntz Bay",
    lat: 47.87186, lon: -92.24131,
    kind: "hump",
    species: ["walleye"],
    structure: "Isolated hump, ~265 ft across, tops out near 15 ft",
    why:
      "Closed 15-ft contour ring in open water on the east end, north of Stuntz Bay — a mid-lake hump away " +
      "from the pressure the named bays see.",
    technique: "Slip-bobber with leech or jig-crawler on the top and edges, 12–15 ft.",
    bestConditions: "Similar water to Big Bay's reefs — light chop over dead calm."
  },
  {
    id: "hump-central-north",
    name: "Open-water hump, north-central basin",
    lat: 47.8927, lon: -92.40345,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~260 ft across, tops out near 20 ft",
    why:
      "Sits in the wide-open main basin between Oak Narrows and Big Bay — a deep hump with no nearby shore, " +
      "the kind of spot that gets ignored because it isn't near any landmark, which usually means less pressure.",
    technique: "Troll or vertical-jig the top and break; treat it like a main-lake reef even though there's no shoreline reference.",
    bestConditions: "Best fished with electronics on — mark the exact top before committing baits."
  },
  {
    id: "hump-frazer",
    name: "Hump near Frazer Bay",
    lat: 47.87014, lon: -92.45143,
    kind: "hump",
    species: ["walleye"],
    structure: "Isolated hump, ~255 ft across, tops out near 15 ft",
    why:
      "Compact 15-ft contour ring about 2 mi off Frazer Bay's mouth — a step-off spot for fish moving between " +
      "the bay's shallow flats and the main lake basin.",
    technique: "Jig-crawler or leech on a slip-bobber, working the top down to the break.",
    bestConditions: "Morning/evening transition times, when fish are moving between the bay and open water."
  },
  {
    id: "hump-wakemup-north",
    name: "Hump north of Wakemup Bay",
    lat: 47.93247, lon: -92.6227,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~250 ft across, tops out near 15 ft",
    why:
      "West-end hump close to Wakemup Bay but out in open water — good option if Wakemup itself is getting " +
      "fished hard, same general depth/structure pattern.",
    technique: "Jig and crawler or slow-troll a crankbait over the crown, 12–15 ft.",
    bestConditions: "Same wind-and-pressure window as Wakemup Bay itself."
  },
  {
    id: "hump-niles-north",
    name: "Open-water hump, north of Niles Bay",
    lat: 47.93694, lon: -92.45956,
    kind: "hump",
    species: ["walleye"],
    structure: "Isolated hump, ~240 ft across, tops out near 20 ft",
    why:
      "Deep-topping hump (20 ft) north of Niles Bay's mud basin — likely holds some of the same roaming " +
      "walleye schools the current report describes, just concentrated on structure instead of flat mud.",
    technique: "Lead-core or bottom bouncer with a spinner, working over and around the top.",
    bestConditions: "Same conditions that work Niles Bay basin — stable/falling pressure, overcast."
  },
  {
    id: "hump-stuntz-northeast",
    name: "Hump northeast of Stuntz Bay",
    lat: 47.85008, lon: -92.21775,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~230 ft across, tops out near 20 ft",
    why:
      "Another east-end hump, deeper-topping than the one north of Stuntz — good follow-up spot if that one " +
      "isn't producing, similar water otherwise.",
    technique: "Vertical jig or troll a deep crankbait along the break, 18–22 ft.",
    bestConditions: "Works well as a midday spot when shallower bays go quiet."
  },

  // --- More named bays, added for wider lake coverage. Each one's depth range below
  // is pulled directly from the DNR contour data near that point (not assumed) —
  // the "why" reasoning applies the same general, well-established patterning as the
  // other spots (shallow warm bay = weed/panfish/muskie water; bay with rock/sand in
  // the 10-20 ft range = the same transition pattern the current reports describe;
  // a shallow bay sitting right next to a steep drop to deep water = a staging area
  // fish use to move between summer and fall water) rather than inventing anything
  // spot-specific that isn't backed by that data.
  {
    id: "pike-bay",
    name: "Pike Bay",
    lat: 47.8105, lon: -92.3207,
    kind: "bay",
    species: ["muskie", "perch", "crappie"],
    structure: "Shallow bay, DNR contours show nothing deeper than ~5 ft nearby",
    why:
      "One of the shallowest named bays on the lake — no real depth to speak of. That rules it out for the " +
      "current walleye pattern (which is keying on rock and mud basins), but shallow, warm, weedy water " +
      "like this is exactly where muskie sun themselves and panfish hold in late summer/early fall.",
    technique: "Muskie: bucktail or topwater over weed flats midday. Panfish/crappie: small jig under a slip-bobber around any visible weed edge.",
    bestConditions: "Warm, calm, sunny stretches — this bay lives on sun, not structure."
  },
  {
    id: "armstrong-bay",
    name: "Armstrong Bay",
    lat: 47.8496, lon: -92.1785,
    kind: "bay",
    species: ["walleye", "perch"],
    structure: "Shallow-to-moderate bay, DNR contours to ~15 ft nearby",
    why:
      "Far east-end bay with the same rock/sand-in-the-teens depth range that's producing lake-wide right " +
      "now. Gets little mention anywhere because it's out past Stuntz Bay — likely low pressure.",
    technique: "Jig and crawler on any sand/rock transition, 8–15 ft.",
    bestConditions: "Same as Stuntz Bay — good calm-water option on windy days."
  },
  {
    id: "norwegian-bay",
    name: "Norwegian Bay",
    lat: 47.9482, lon: -92.5568,
    kind: "bay",
    species: ["walleye", "muskie"],
    structure: "Moderate-depth bay, DNR contours to ~20 ft nearby",
    why:
      "North-end bay near Black Bay with real depth behind it (contours to 20 ft), not just a shallow weed " +
      "pocket — enough to hold walleye on the deeper edge while muskie work the shallower shoreline.",
    technique: "Walleye: jig-crawler or leech worked along the deeper edge, 12–20 ft. Muskie: bucktail along the shoreline weed edge.",
    bestConditions: "Similar window to Black Bay — stable, warm stretch."
  },
  {
    id: "head-of-lakes-bay",
    name: "Head of the Lakes Bay",
    lat: 47.9410, lon: -92.6466,
    kind: "bay",
    species: ["walleye", "smallmouth"],
    structure: "Shallow flat right next to deep water — DNR contours nearby run out to ~50 ft",
    why:
      "Far west-end bay where a shallow flat sits directly against a steep break to real depth (50 ft close " +
      "by). That kind of shallow-to-deep transition is a classic staging area fish use moving between " +
      "summer bay cover and deeper fall water — worth checking the edge where the flat drops off.",
    technique: "Work the drop-off edge itself: jig-crawler up shallow, switch to a jigging spoon or livebait rig if fish are holding deeper on the break.",
    bestConditions: "Especially worth a look once nights turn consistently cooler and fish start relating to that break."
  },
  {
    id: "white-eagle-bay",
    name: "White Eagle Bay",
    lat: 47.9389, lon: -92.6634,
    kind: "bay",
    species: ["walleye", "smallmouth"],
    structure: "Shallow flat next to deep water — DNR contours nearby run out to ~50 ft",
    why:
      "Same setup as Head of the Lakes Bay next door — shallow water backed by a real drop to 50 ft. The " +
      "extreme far-west corner of the lake, about as low-pressure as Vermilion gets.",
    technique: "Same approach as Head of the Lakes: fish the break where shallow meets deep, adjust depth to where you mark fish.",
    bestConditions: "Worth the long boat ride mainly when you want water nobody else is fishing."
  },
  {
    id: "greenwood-bay",
    name: "Greenwood Bay",
    lat: 47.8799, lon: -92.4029,
    kind: "bay",
    species: ["walleye", "perch"],
    structure: "Shallow-to-moderate bay, DNR contours to ~15 ft nearby",
    why:
      "Central bay between Frazer Bay and Oak Narrows with the same rock/sand depth range as the water " +
      "that's currently producing — a reasonable stop between those two spots.",
    technique: "Jig and crawler on the sand/rock transition, 8–15 ft.",
    bestConditions: "Good midday option between Frazer Bay and Oak Narrows."
  },
  {
    id: "waconda-bay",
    name: "Waconda Bay",
    lat: 47.8955, lon: -92.5296,
    kind: "bay",
    species: ["walleye"],
    structure: "Moderate-depth bay, DNR contours to ~20 ft nearby",
    why:
      "West-central bay with real depth (to 20 ft) close by, similar to Niles Bay a couple miles north — " +
      "worth a look if Niles is crowded or not producing.",
    technique: "Jig-crawler on the deeper edge, or lead-core/spinner if fish are suspended off the flat.",
    bestConditions: "Same as Niles Bay basin — stable or falling pressure, overcast."
  },

  // --- More sunken humps from the same DNR contour analysis as before, filling in
  // the west end and south shore where the first pass left gaps.
  {
    id: "hump-far-west",
    name: "Open-water hump, far west end",
    lat: 47.9407, lon: -92.65504,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~285 ft across, tops out near 10 ft",
    why:
      "Compact 10-ft contour ring out past Head of the Lakes/White Eagle Bay — the westernmost hump found " +
      "in the survey data. Shallower-topping than the other humps, worth a look earlier in the day before " +
      "the sun gets high.",
    technique: "Jig-crawler or slip-bobber over the top, 8–12 ft, working out to the break.",
    bestConditions: "Low light — this one's shallow enough that it'll fish best morning/evening."
  },
  {
    id: "hump-norwegian-open",
    name: "Open-water hump near Norwegian Bay",
    lat: 47.93099, lon: -92.59152,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~290 ft across, tops out near 15 ft",
    why:
      "One of the larger compact contour rings found in the west-end survey data — sits between Norwegian " +
      "and Wakemup Bay in open water.",
    technique: "Slip-bobber with leech on the top and edges, 12–15 ft, or slow-troll a crankbait over it.",
    bestConditions: "Same as the other west-end humps — light chop, stable pressure."
  },
  {
    id: "hump-everett-south",
    name: "Open-water hump, south of Everett Bay",
    lat: 47.84243, lon: -92.28778,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~260 ft across, tops out near 15 ft",
    why:
      "Fills in the south-shore gap between Everett Bay and Pike Bay — a real compact 15-ft ring in open " +
      "water, away from any named landmark.",
    technique: "Jig-crawler or slip-bobber leech on the top, 12–15 ft.",
    bestConditions: "Light chop over dead calm, same as the other reef-style humps."
  },
  {
    id: "hump-oaknarrows-south",
    name: "Open-water hump, south of Oak Narrows",
    lat: 47.84538, lon: -92.34447,
    kind: "hump",
    species: ["walleye"],
    structure: "Isolated hump, ~205 ft across, tops out near 20 ft",
    why:
      "Deeper-topping hump on the south side of the main basin — the kind of structure that holds roaming " +
      "walleye schools the same way the deep mud basins do, just concentrated on a hard bottom instead.",
    technique: "Lead-core or vertical jig, working the 18–22 ft range around the top.",
    bestConditions: "Stable or falling pressure, similar to the deep mud basin pattern."
  },
  {
    id: "hump-frazer-central",
    name: "Open-water hump, central basin near Frazer Bay",
    lat: 47.89249, lon: -92.4529,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~290 ft across, tops out near 15 ft",
    why:
      "One of the larger humps in the survey data, sitting in the wide-open central basin — a legitimate " +
      "main-lake reef with no shoreline reference, so it likely sees very little fishing pressure.",
    technique: "Troll or vertical-jig the top and break, 12–15 ft.",
    bestConditions: "Mark it with electronics first — no landmark means you have to find the exact crown yourself."
  },
  {
    id: "hump-bigbay-north",
    name: "Open-water hump, north of Big Bay",
    lat: 47.86909, lon: -92.26208,
    kind: "hump",
    species: ["walleye", "smallmouth"],
    structure: "Isolated hump, ~295 ft across, tops out near 15 ft",
    why:
      "Large compact ring just north of Big Bay's reef complex — same structure type and depth as what's " +
      "producing there, just far enough off to see less pressure.",
    technique: "Slip-bobber with jumbo leech on the reef edge, 12–15 ft, same as Big Bay itself.",
    bestConditions: "Light chop over dead calm."
  }
];

const SPECIES_INFO = {
  walleye: { color: "#5522DD", label: "Walleye" },
  smallmouth: { color: "#1B7A43", label: "Smallmouth Bass" },
  muskie: { color: "#B23A1F", label: "Muskie" },
  perch: { color: "#D19A00", label: "Perch" },
  crappie: { color: "#3AA6A0", label: "Crappie" }
};
