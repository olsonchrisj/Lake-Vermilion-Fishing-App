// Written by Claude (an AI model) in a Claude Code session, from the app's season model,
// the latest guide report, the NWS forecast and the barometer trend, plus the angler's own
// on-the-water reports. Overwritten each refresh. app.js labels it as AI-written and ignores
// it after 10 days.
const WEEKLY_ANALYSIS = {
  "generatedAt": "2026-10-02T12:52:48Z",
  "model": "claude-sonnet-5 (written by Claude in a Claude Code session)",
  "seasonPhase": "Early fall (cooling, pre-turnover)",
  "waterTempEstimateF": 53,
  "waterTempSource": "seasonal average",
  "headline": "Hard frost overnight, high pressure building fast - fish push deep today",
  "season_read": "The predicted hard freeze arrived: around 34F at the Cook station early this morning with patchy frost. The barometer has jumped to roughly 1024 hPa and is still climbing - strong, building high pressure behind the week's front. Still no new guide report (last one Sept 23); the daily scraper checked again this morning and found nothing new.",
  "patterns": [
    {
      "title": "Bright, calm, high pressure pushes fish deep (inference)",
      "detail": "Clear skies, light wind and a strong, rising barometer are the classic conditions that push fish tight to the deepest nearby structure rather than roaming or holding shallow. Favor the 18-26 ft humps and the deep basin over shallow bays and open flats today."
    },
    {
      "title": "Frosty mornings, warm windows midday",
      "detail": "Expect a slow start right after the frost breaks, with the better bite building as the sun warms the water through midday. First light is still worth fishing shallow weed edges and current before the sky goes fully bright and calm."
    },
    {
      "title": "Short warm-up, then cold again",
      "detail": "Temperatures climb back into the upper 50s through Monday with another rain chance Saturday, then another hard frost Sunday night (low 33) and Monday morning. Expect this bright-calm, then front, then bright-calm cycle to repeat a few more times before real turnover."
    },
    {
      "title": "Pattern still cooling toward turnover (inference)",
      "detail": "Two hard frosts within a week is a faster cooldown than early September saw. Nothing is confirmed yet, but each cold snap moves the lake closer to mixing; keep checking your sonar for even temperatures top to bottom."
    }
  ],
  "turnover_watch": "Not confirmed. Two frosty mornings in a week point toward faster cooling than typical early fall. If deep structure like the picks above goes quiet the same day the lake looks stirred up or discolored, or your sonar shows even temperature top to bottom, that's the turnover signal to watch for.",
  "weather_outlook": "Today: patchy frost early, then sunny and mild, high 57, light NW wind. Mild and mostly calm through the weekend with a rain chance Saturday (high 58). Sunday clears and cools hard again (low 33, frost). Monday frost then sun (58). Warms back up Tuesday-Wednesday (64-66). Barometer is high and still rising, around 1024 hPa this morning.",
  "best_windows": "First light today, right as the frost breaks, before skies go fully bright and calm - work shallow weed edges and current areas then. Through midday and afternoon, favor the deep humps and basin while the high-pressure bluebird pattern holds. Watch for Saturday's rain as the next pre-front window, then expect another frosty, bright-calm reset Sunday into Monday.",
  "top_spots": [
    {
      "id": "hump-central-north",
      "why": "20 ft hump top - bright, calm, high and rising pressure pushes fish down onto deep structure exactly like this."
    },
    {
      "id": "hump-everett-open",
      "why": "Same depth, same logic: a defined deep top is where fish sit tight under today's clear, calm high pressure."
    },
    {
      "id": "hump-niles-north",
      "why": "Deep hump in the basin area; a strong match for fish pushed deep by today's building high pressure."
    },
    {
      "id": "hump-oaknarrows-south",
      "why": "Combines a deep structure top with current, a strong pairing on a calm, bright day with no wind to load bait elsewhere."
    },
    {
      "id": "niles-basin",
      "why": "Deep mud basin at 28-34 ft; the deepest option on the lake fits today's bright, calm, high-pressure pattern well."
    }
  ],
  "spot_notes": [
    {
      "id": "niles-basin",
      "note": "Deep mud basin at 28-34 ft. High, rising pressure and bright, calm skies push basin fish deep and tight; this is a good default today, worked slowly."
    },
    {
      "id": "oak-narrows",
      "note": "Current seam at 8-16 ft. Current keeps producing even in calm, high-pressure bluebird conditions; a solid daytime option while open water goes quiet."
    },
    {
      "id": "big-bay-reefs",
      "note": "Rock reefs at 12-18 ft. Clear, calm, high-pressure days push fish tight to the reef itself rather than roaming the flat beside it; fish the edge slowly."
    },
    {
      "id": "stuntz-bay",
      "note": "Weed points at 8-15 ft. Remaining weed edges are worth a look at first light before the sun gets up and skies go bright and calm."
    },
    {
      "id": "black-bay",
      "note": "Shallow weedy bay, 2-8 ft. A frosty morning followed by a calm, bright, warming afternoon can still pull muskie shallow for a window at midday."
    },
    {
      "id": "wakemup-bay",
      "note": "Sand-to-rock break at 8-16 ft. Fish the break tight and slow; bright, calm, high-pressure days are tougher here than on windy ones."
    },
    {
      "id": "everett-bay",
      "note": "Sheltered shallow bay, 8-14 ft. Likely slow under calm, bright skies; best at first light right after this morning's frost, before the sun warms the shallows."
    },
    {
      "id": "muskego-point",
      "note": "Main-lake point, 6-25 ft, muskie and smallmouth. Calm and bright with no wind to load bait isn't ideal here; best early, before the day fully brightens."
    },
    {
      "id": "vermilion-dam-rapids",
      "note": "Current seam at the outlet, 4-12 ft. Current areas hold up well in calm, high-pressure stretches; worth a stop any time of day."
    },
    {
      "id": "hump-everett-open",
      "note": "Open-water hump, top near 20 ft. Bright, calm, high and rising pressure is exactly when fish push down onto structure like this; a strong pick today."
    },
    {
      "id": "hump-stuntz-north",
      "note": "Hump top near 15 ft. A fine option today, though the deeper humps below are a tighter match for how deep fish should be sitting under this bright, calm high."
    },
    {
      "id": "hump-central-north",
      "note": "Open-water hump, top near 20 ft, on the deep side. One of the better picks today: bright, calm, high pressure pushes fish to exactly this kind of deep structure."
    },
    {
      "id": "hump-frazer",
      "note": "Hump top near 15 ft. Solid backup; the deeper humps are the sharper match for today's bright, calm, high-pressure pattern."
    },
    {
      "id": "hump-wakemup-north",
      "note": "Hump top near 15 ft on the west end. A fine option; deeper structure is the better bet while skies stay clear and calm."
    },
    {
      "id": "hump-niles-north",
      "note": "Open-water hump, top near 20 ft, in the mud-basin area. A strong pick today as fish push deep under the building high pressure."
    },
    {
      "id": "hump-stuntz-northeast",
      "note": "Hump top near 20 ft with a deeper break. Work the break at 18-22 ft; a good match for fish sitting deep under today's bright, calm skies."
    },
    {
      "id": "pike-bay",
      "note": "Very shallow, 1-5 ft. Cold, frosty mornings and bright, calm afternoons both push fish away from water this shallow; muskie-only interest at best."
    },
    {
      "id": "armstrong-bay",
      "note": "Shallow-to-moderate bay, 8-15 ft. Best at first light before the sun and calm skies take hold; a lower-priority spot through midday."
    },
    {
      "id": "norwegian-bay",
      "note": "Bay edge at 12-20 ft. The deeper edge is the better part of this bay today; muskie may still work the weed line early before full sun."
    },
    {
      "id": "head-of-lakes-bay",
      "note": "Shallow flat next to deep water, 8-30 ft. Start on the deep side of the break today - bright, calm, high pressure pushes fish down, not up onto the flat."
    },
    {
      "id": "white-eagle-bay",
      "note": "Same setup as Head of the Lakes: fish the deep side of the break first under today's clear, calm, high-pressure skies."
    },
    {
      "id": "greenwood-bay",
      "note": "Shallow-to-moderate bay, 8-15 ft. A first-light option only; midday bright and calm conditions favor the deeper humps and flats."
    },
    {
      "id": "waconda-bay",
      "note": "Bay edge at 10-20 ft. If fish are off the flat and suspended, this can produce, but the deeper humps are a stronger bet under today's high pressure."
    },
    {
      "id": "hump-far-west",
      "note": "Shallowest hump, top near 10 ft. Best at dawn right after this morning's frost breaks, before skies go fully bright and calm."
    },
    {
      "id": "hump-norwegian-open",
      "note": "Hump top near 15 ft. A reasonable option; the deeper humps better match where fish should sit today."
    },
    {
      "id": "hump-everett-south",
      "note": "Hump top near 15 ft on the east side. Fine backup behind the deeper humps given today's bright, calm, high-pressure pattern."
    },
    {
      "id": "hump-oaknarrows-south",
      "note": "Hump top near 20 ft next to the Oak Narrows current. Current plus a deep structure top is a strong combination on a calm, bright, high-pressure day like today."
    },
    {
      "id": "hump-frazer-central",
      "note": "Hump top near 15 ft. Steady option; the deeper humps are the sharper pick while the high builds in."
    },
    {
      "id": "hump-bigbay-north",
      "note": "Reef-like hump near Big Bay, top near 15 ft. Fish it like the Big Bay reefs - tight and slow under today's bright, calm skies."
    }
  ],
  "confidence": "medium",
  "caveats": "No new guide report or measured water temperature since Sept 23; the water temperature and the bright-calm-pushes-fish-deep call are both inference from the weather pattern, not a direct observation."
};
