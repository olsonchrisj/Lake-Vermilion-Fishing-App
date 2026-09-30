// Written by Claude (an AI model) in a Claude Code session, from the app's season model,
// the latest guide report, the NWS forecast and the barometer trend. Overwritten each time
// the outlook is refreshed. app.js labels it as AI-written and ignores it after 10 days.
const WEEKLY_ANALYSIS = {
  "generatedAt": "2026-09-30T12:35:51Z",
  "model": "claude-sonnet-5 (written by Claude in a Claude Code session)",
  "seasonPhase": "Early fall (cooling, pre-turnover)",
  "waterTempEstimateF": 56,
  "waterTempSource": "seasonal average",
  "headline": "Post-front reset: fish tight to structure today, then cold, clear and calmer",
  "season_read": "A day of all-day rain just passed through: the barometer bottomed near 1005 hPa overnight and is now slowly rising. No guide report has posted since Sept 23 (walleye on 12-25 ft transitions, fall bite building), so this read leans on the weather pattern rather than fresh catch reports. Expect a typical post-front adjustment period before the bite settles back in.",
  "patterns": [
    {
      "title": "Post-front, tight to structure (inference)",
      "detail": "Rising pressure behind a big rain system usually pushes fish tight to defined structure - humps, breaks, current seams - rather than roaming open flats or suspending. Slow down and fish vertically over the best spots instead of covering water."
    },
    {
      "title": "Current stays productive",
      "detail": "Oak Narrows and the dam outlet concentrate baitfish in current, which tends to keep producing even when the rest of the lake goes quiet after a front. Good first stops today."
    },
    {
      "title": "Clearing and colder behind the rain",
      "detail": "Skies clear through the week with lows dropping into the 30s by Thursday and Friday night, including frost. Cooling water should keep pushing the pre-turnover pattern along faster than a calm week would."
    },
    {
      "title": "Watch Saturday's next system",
      "detail": "Rain returns Saturday into Saturday night with south then west wind. That is another front-timing window worth fishing ahead of, then expect another short adjustment period after."
    }
  ],
  "turnover_watch": "Not confirmed. Estimated surface temp is around 56F and falling with several nights near or below freezing coming. If you are seeing bait and marks scatter, or the same temperature top to bottom on sonar, that is a turnover sign - tell the app your reading. Otherwise this still reads as early fall, not turnover, for now.",
  "weather_outlook": "Today clears out (patchy fog, then mostly sunny, high 70) behind last night's rain. Turning cold and clear Wed night through Friday, lows in the 30s with frost both nights. Rain returns Saturday into Saturday night, then patchy frost again Sunday. Barometer bottomed overnight near 1005 hPa and is slowly rising now.",
  "best_windows": "Today and tomorrow, expect a short, tighter bite while the lake resets from the front - fish structure hard, don't expect a wide-open bite. Wednesday and Thursday, clearing skies with a rising, steadying barometer should bring the best fishing of the week, especially dusk. Friday to Sunday, treat any hour before the Saturday rain as a pre-front window.",
  "top_spots": [
    {
      "id": "oak-narrows",
      "why": "Current seam that stays productive when the lake goes quiet after a front; fishes the reported 12-25 ft transition depths at its shallow end."
    },
    {
      "id": "hump-everett-open",
      "why": "A defined structure top (20 ft) is exactly where post-front fish tuck in tight rather than roam open water."
    },
    {
      "id": "muskego-point",
      "why": "Deep water close to a main-lake point is a classic post-front muskie and smallmouth setup once skies clear."
    },
    {
      "id": "vermilion-dam-rapids",
      "why": "Current seams hold up better than open water the day after rain, and flow is likely elevated from the storm."
    },
    {
      "id": "hump-oaknarrows-south",
      "why": "Combines current with structure at 18-22 ft, a strong post-front pairing."
    }
  ],
  "spot_notes": [
    {
      "id": "niles-basin",
      "note": "Deep mud basin at 28-34 ft. Post-front, roaming basin walleye can go quiet for a day; lead-core is still a good way to cover water if the reefs are fishing tough."
    },
    {
      "id": "oak-narrows",
      "note": "Sand-to-rock current seam at 8-16 ft. Current concentrates bait right now while the lake resets after the front; a solid bet for tighter, structure-hugging fish."
    },
    {
      "id": "big-bay-reefs",
      "note": "Rock reefs at 12-18 ft. Post-front fish sit tighter to the rock than mid-water; slow down and work the reef edge itself rather than the open flat beside it."
    },
    {
      "id": "stuntz-bay",
      "note": "Weed points at 8-15 ft. Weeds are thinning fast with the cooling water; fish the remaining green edges and the inside turns rather than open weed flats."
    },
    {
      "id": "black-bay",
      "note": "Shallow weedy bay, 2-8 ft. Muskie can still fire here in the afternoon warm-up, but walleye will be tough this shallow with clearing skies and cold nights."
    },
    {
      "id": "wakemup-bay",
      "note": "Sand-to-rock break at 8-16 ft. A tighter, slower presentation on the break itself should out-produce open sand the day after a front like this."
    },
    {
      "id": "everett-bay",
      "note": "Sheltered shallow bay, 8-14 ft. Good backup if wind stays up behind the front; otherwise a dusk-only walleye bet with perch and crappie shallower."
    },
    {
      "id": "muskego-point",
      "note": "Main-lake point, 6-25 ft, deep water close to shore. Classic post-front muskie and smallmouth spot once the sun gets on it and clears; fish the point through midday."
    },
    {
      "id": "vermilion-dam-rapids",
      "note": "Current seam at the outlet, 4-12 ft. Rain likely bumped flow here; current seams like this stay productive even when the rest of the lake goes quiet after a front."
    },
    {
      "id": "hump-everett-open",
      "note": "Open-water hump, top near 20 ft. A good default today: fish tuck to structure like this after a front rather than roaming open water. Slow vertical presentation over the top."
    },
    {
      "id": "hump-stuntz-north",
      "note": "Hump top near 15 ft. Sits in the transition zone guides have reported; work it slowly today rather than trolling past it."
    },
    {
      "id": "hump-central-north",
      "note": "Open-water hump, top near 20 ft, on the deeper side. Good if fish pushed deeper behind the front; try lead-core or a deep crankbait."
    },
    {
      "id": "hump-frazer",
      "note": "Hump top near 15 ft. Straightforward jig-and-crawler or leech spot; nothing about this week's weather rules it out."
    },
    {
      "id": "hump-wakemup-north",
      "note": "Hump top near 15 ft on the west end. Same tight, slow approach as the rest of the humps today; work the crown down to the break."
    },
    {
      "id": "hump-niles-north",
      "note": "Open-water hump, top near 20 ft, in the mud-basin area. A lead-core or bottom-bouncer pass here can find fish that scattered off the basin after the front."
    },
    {
      "id": "hump-stuntz-northeast",
      "note": "Hump top near 20 ft with a deeper break. Vertical jig the break at 18-22 ft; a good choice if the wind is still up from the front."
    },
    {
      "id": "pike-bay",
      "note": "Very shallow, 1-5 ft. Cooling water and clearing skies push fish out of water this shallow; only worth a stop for muskie or panfish right now."
    },
    {
      "id": "armstrong-bay",
      "note": "Shallow-to-moderate bay, 8-15 ft. A calm-day, low-light option; not the first choice with a post-front bite still settling."
    },
    {
      "id": "norwegian-bay",
      "note": "Bay edge at 12-20 ft. Walleye on the deeper edge fits a post-front, tight-to-structure pattern; muskie may still work the weed line midday."
    },
    {
      "id": "head-of-lakes-bay",
      "note": "Shallow flat next to deep water, 8-30 ft. Good today specifically because you can fish the break itself and slide deeper if shallow is dead after the front."
    },
    {
      "id": "white-eagle-bay",
      "note": "Same setup as Head of the Lakes: flat beside deep water. Work the break and adjust depth until you mark fish."
    },
    {
      "id": "greenwood-bay",
      "note": "Shallow-to-moderate bay, 8-15 ft. A dusk-only bet this week; daytime fish are likely holding tighter to structure after the front."
    },
    {
      "id": "waconda-bay",
      "note": "Bay edge at 10-20 ft. If fish are off the flat and suspended, a lead-core or spinner pass can find them post-front."
    },
    {
      "id": "hump-far-west",
      "note": "Shallowest hump, top near 10 ft. Best right at dusk when fish move up; a slow jig or slip bobber is the play today."
    },
    {
      "id": "hump-norwegian-open",
      "note": "Hump top near 15 ft. Slip bobber with a leech, or a slow troll over the top; nothing in the forecast rules this one out."
    },
    {
      "id": "hump-everett-south",
      "note": "Hump top near 15 ft on the east side. Same tight, slow presentation as the other humps while the bite resets after the front."
    },
    {
      "id": "hump-oaknarrows-south",
      "note": "Hump top near 20 ft by the Oak Narrows current. Current plus structure is a strong combination the day after rain; work 18-22 ft."
    },
    {
      "id": "hump-frazer-central",
      "note": "Hump top near 15 ft. Troll or vertical-jig the top and break; a steady, low-risk pick this week."
    },
    {
      "id": "hump-bigbay-north",
      "note": "Reef-like hump near Big Bay, top near 15 ft. Same slip-bobber-on-the-edge approach as Big Bay itself."
    }
  ],
  "confidence": "medium",
  "caveats": "No fresh guide report or water temperature since Sept 23; this outlook leans on the weather and barometer pattern, not new catch reports. Season phase and turnover timing are inference, not a measurement."
};
