// Written by Claude (an AI model) in a Claude Code session, from the app's season model,
// the latest guide report, the NWS forecast and the barometer trend. Overwritten each time
// the outlook is refreshed. app.js labels it as AI-written and ignores it after 10 days.
const WEEKLY_ANALYSIS = {
  "generatedAt": "2026-09-26T15:46:44Z",
  "model": "claude-sonnet-5 (written by Claude in a Claude Code session)",
  "seasonPhase": "Early fall (cooling, pre-turnover)",
  "waterTempEstimateF": 58,
  "waterTempSource": "seasonal average",
  "headline": "Broad, healthy fall bite; cold nights late in the week could start turnover",
  "season_read": "Patriot Guide Service (Sept 23) reports a good bite with walleye on transitions and rock edges at 12 to 25 feet, spread from a few feet down past 30, and says fall fishing is approaching its peak. That fits a pre-turnover pattern. No guide has posted a water temperature since late August (69 to 72°F), so the roughly 58°F the app uses is an estimate.",
  "patterns": [
    {
      "title": "Transitions and rock edges",
      "detail": "Guides report walleye at the bottoms of rocks at 12 to 25 feet on the east end, and on sand at 10 to 20 feet and deep rock edges at 12 to 30 feet on the west. A Lindy rig with crawlers, leeches or minnows is working."
    },
    {
      "title": "Stay flexible on depth",
      "detail": "Fish are reported from a couple of feet to over 30 feet, and lead-core is catching fish at 20 to 30 feet. Keep moving until you mark fish and be ready to switch methods."
    },
    {
      "title": "Dusk shallower (inference)",
      "detail": "As the water cools, expect walleye to slide shallower on wind-blown rock and points at low light. This is a general fall pattern, not something the guides reported this week."
    },
    {
      "title": "Muskie before the front (inference)",
      "detail": "Muskie tend to feed hard as fall cooling starts. Points and weed edges ahead of the storms Monday night and Tuesday are worth casting."
    }
  ],
  "turnover_watch": "Not confirmed yet. Check your sonar for the same temperature top to bottom, cloudy or greenish water, foam on windy shores, and scattered or suspended fish. Highs in the low 60s and lows near 38 to 39°F on Thursday and Friday nights, with west then north wind, are the likeliest push, so turnover could begin in one to two weeks (inference). Enter a water temperature in the app once you are out.",
  "weather_outlook": "Warm and cloudy through Monday with highs in the upper 60s, showers tonight, then showers and thunderstorms likely Monday night into Tuesday. Cooler behind that: highs low 60s Thursday and Friday, wind west then north. The barometer is high but eased from about 1025 to 1022 hPa in the last day.",
  "best_windows": "Sunday and Monday look stable with light wind. Monday evening, before the storms, and the hours before any front are the best bets. Expect a tougher, tighter bite the day after storms clear. Dusk is the best low-light window all week; Wednesday evening looks calm with light southwest wind.",
  "top_spots": [
    {
      "id": "oak-narrows",
      "why": "Sand-to-rock transition at the shallow end of the reported pattern, and it fishes well in wind or current and at dusk."
    },
    {
      "id": "big-bay-reefs",
      "why": "Rock reefs at 12 to 18 feet sit inside the transition zone guides report; work the edges with a Lindy rig or slip bobber."
    },
    {
      "id": "hump-everett-open",
      "why": "A 20 foot top with a break to deeper water, matching the deep rock edges guides report at 12 to 30 feet."
    },
    {
      "id": "head-of-lakes-bay",
      "why": "A shallow flat beside deep water lets you test 8 to 30 feet in one place, which suits the guides' advice to keep moving until you find fish."
    },
    {
      "id": "muskego-point",
      "why": "Main-lake point with deep water close by, good for muskie ahead of Monday night's storms and the cooling behind them."
    }
  ],
  "spot_notes": [
    {
      "id": "niles-basin",
      "note": "Deep mud fits the lead-core fish guides mention at 20 to 30 feet, but it sits at the deep end of their range. Try it when wind makes the reefs rough or you want to troll and cover water."
    },
    {
      "id": "oak-narrows",
      "note": "Sand-to-rock transition at 8 to 16 feet, the shallow end of the pattern guides report. Good in wind or current, and a strong dusk bet as the water cools."
    },
    {
      "id": "big-bay-reefs",
      "note": "Rock reefs at 12 to 18 feet sit inside the 12 to 25 foot transition zone guides report. Work reef edges with a Lindy rig or slip bobber, especially at dusk."
    },
    {
      "id": "stuntz-bay",
      "note": "Weed edges are dying back as the water cools, so fish may slide to the nearest rock or break. A wind-sheltered backup more than a first choice."
    },
    {
      "id": "black-bay",
      "note": "Shallow weeds are fading. Muskie may still cruise the edges before Monday night's front, but walleye bites here should be short. Worth a few casts if you want a muskie."
    },
    {
      "id": "wakemup-bay",
      "note": "Sand-to-rock break at 8 to 16 feet, like the west-end sand and rock edges guides report at 10 to 20 feet. Jig and crawler along the break."
    },
    {
      "id": "everett-bay",
      "note": "Sheltered and shallow: good in strong wind and for perch and crappie. A walleye bite here likely depends on dusk."
    },
    {
      "id": "muskego-point",
      "note": "Main-lake point with deep water close by. A good muskie spot ahead of Monday night's storms and the cooling that follows; cast the wind-facing edge."
    },
    {
      "id": "vermilion-dam-rapids",
      "note": "Shallow current seam that fishes best in low light. Not the main pattern this week, but it can hold walleye and smallmouth when flow is up after rain."
    },
    {
      "id": "hump-everett-open",
      "note": "A top near 20 feet with a break to deeper water fits the deep rock edges guides report at 12 to 30 feet. Vertical jig or slow troll, best at dusk."
    },
    {
      "id": "hump-stuntz-north",
      "note": "A 15 foot top in the middle of the reported 12 to 25 foot zone. Slip bobber or jig with a leech; fish the top at dusk and the edges by day."
    },
    {
      "id": "hump-central-north",
      "note": "A 20 foot top toward the deeper part of the pattern. Good for lead-core or vertical jigging if fish are holding deeper."
    },
    {
      "id": "hump-frazer",
      "note": "A 15 foot top that fits the transition depths guides report. Jig and crawler or leech on the crown, then work the break."
    },
    {
      "id": "hump-wakemup-north",
      "note": "A 15 foot top on the west end, where guides report rock edges at 12 to 30 feet. Jig and crawler, or slow-troll a crankbait."
    },
    {
      "id": "hump-niles-north",
      "note": "A 20 foot top in the mud-basin area. Lead-core or a bottom bouncer with a spinner over and around the top."
    },
    {
      "id": "hump-stuntz-northeast",
      "note": "A 20 foot top with a deeper break. Vertical jig or a deep crankbait at 18 to 22 feet, good if fish are on deep edges."
    },
    {
      "id": "pike-bay",
      "note": "Very shallow, under 5 feet, so walleye are unlikely this week. Only a muskie or panfish stop, and cooling water will push fish out."
    },
    {
      "id": "armstrong-bay",
      "note": "Shallow-to-moderate bay. Jig and crawler on any sand or rock transition; better at dusk, and a reasonable sheltered option in wind."
    },
    {
      "id": "norwegian-bay",
      "note": "The 12 to 20 foot edge lines up with the reported depths. Walleye on the deeper edge; muskie along weed lines before the front."
    },
    {
      "id": "head-of-lakes-bay",
      "note": "A shallow flat beside deep water lets you fish 8 to 30 feet from one spot, matching the guides' advice to try several depths. Start on the break and adjust."
    },
    {
      "id": "white-eagle-bay",
      "note": "Same setup as Head of the Lakes: a flat next to deep water. Good for testing depths until you mark fish."
    },
    {
      "id": "greenwood-bay",
      "note": "Shallow-to-moderate bay with sand or rock transitions. A solid dusk option; jig and crawler at 8 to 15 feet."
    },
    {
      "id": "waconda-bay",
      "note": "The 10 to 20 foot edge is inside the pattern. If fish are suspended off the flat, lead-core or a spinner can cover water."
    },
    {
      "id": "hump-far-west",
      "note": "The shallowest hump, with a top around 10 feet. Best at dusk or in low light when fish move up; slip bobber or jig and crawler."
    },
    {
      "id": "hump-norwegian-open",
      "note": "A 15 foot top. Slip bobber with a leech on the top and edges, or slow-troll a crankbait over it."
    },
    {
      "id": "hump-everett-south",
      "note": "A 15 foot top on the east side. Jig and crawler or a slip bobber with a leech, best in low light."
    },
    {
      "id": "hump-oaknarrows-south",
      "note": "A 20 foot top near the Oak Narrows current. Lead-core or vertical jig around 18 to 22 feet."
    },
    {
      "id": "hump-frazer-central",
      "note": "A 15 foot top. Troll or vertical-jig the top and break; fits the 12 to 25 foot transition pattern."
    },
    {
      "id": "hump-bigbay-north",
      "note": "A 15 foot reef near Big Bay. Slip bobber with a jumbo leech on the edge, same approach as the Big Bay reefs."
    }
  ],
  "confidence": "medium",
  "caveats": "Only one guide report is recent (Sept 23) and no water temperature has been reported since late August. The season phase and turnover timing are inference from the calendar and forecast, not measurements."
};
