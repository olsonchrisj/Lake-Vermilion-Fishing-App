#!/usr/bin/env node
// Weekly Claude analysis: gathers the season model, the guide reports, the NWS forecast and
// the barometer trend, asks Claude for a written outlook plus a note for every spot, validates
// it, and writes analysis.weekly.js. Run by .github/workflows/weekly-analysis.yml.
//
//   node scripts/weekly-analysis.mjs             # real run (needs ANTHROPIC_API_KEY)
//   node scripts/weekly-analysis.mjs --dry-run   # assemble + print the prompt, no API call, no file written
//
// If anything fails, the previous analysis.weekly.js is left untouched.

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { MODEL, SCHEMA, SYSTEM_PROMPT, loadAppData, buildFacts, buildUserPrompt, validateAnalysis, renderOutputFile } from './weekly-lib.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const root = (f) => new URL(`../${f}`, import.meta.url);
const UA = { 'User-Agent': 'lake-vermilion-app-weekly-analysis/1.0', Accept: 'application/geo+json' };

async function getJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function loadWeather(app) {
  const { gridId, gridX, gridY } = app.LAKE.weatherPoint;
  const weather = { periods: null, observations: null };
  try {
    weather.periods = (await getJson(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`)).properties.periods;
  } catch (e) { console.warn('Forecast unavailable:', e.message); }
  for (const id of ['KCQM', 'KELO', 'KEVM']) {
    try {
      const obs = (await getJson(`https://api.weather.gov/stations/${id}/observations?limit=100`)).features;
      if (app.pressureTrend(obs)) { weather.observations = obs; break; }
    } catch (e) { console.warn(`Observations from ${id} unavailable:`, e.message); }
  }
  return weather;
}

async function loadPrevious() {
  try {
    const text = await readFile(root('analysis.weekly.js'), 'utf8');
    const m = text.match(/const WEEKLY_ANALYSIS = (\{[\s\S]*\});\s*$/);
    return m ? JSON.parse(m[1]) : null;
  } catch { return null; }
}

async function main() {
  const sources = {
    data: await readFile(root('data.js'), 'utf8'),
    analysis: await readFile(root('analysis.js'), 'utf8'),
    reports: await readFile(root('reports.auto.js'), 'utf8')
  };
  const app = loadAppData(sources, (code) => vm.runInNewContext(code, {}, { timeout: 5000 }));
  const now = new Date();
  const facts = buildFacts({ app, weather: await loadWeather(app), previous: await loadPrevious(), now });
  const prompt = buildUserPrompt(facts);
  console.log(`Assembled prompt: ${prompt.length} characters, ${facts.spots.length} spots, ${facts.guide_reports.length} reports.`);

  if (DRY_RUN) {
    console.log('--- DRY RUN: nothing sent to the API, no file written ---');
    console.log(prompt.slice(0, 6000));
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set (add it as a repository secret).');

  const client = new Anthropic();
  // Streaming avoids HTTP timeouts on a long, thinking-heavy response. The server-side
  // fallback re-runs the request on another model if the safety classifiers decline it.
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });
  const message = await stream.finalMessage();
  console.log(`stop_reason=${message.stop_reason} model=${message.model} usage=${JSON.stringify(message.usage)}`);
  if (message.stop_reason === 'refusal') throw new Error(`Claude declined the request: ${JSON.stringify(message.stop_details)}`);
  if (message.stop_reason === 'max_tokens') throw new Error('Response was cut off at max_tokens');

  const text = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const analysis = validateAnalysis(JSON.parse(text), app.SPOTS.map(s => s.id));
  const meta = {
    generatedAt: now.toISOString(),
    model: message.model,
    seasonPhase: facts.model_estimates.season_phase,
    waterTempEstimateF: facts.model_estimates.water_temp_f,
    waterTempSource: facts.model_estimates.water_temp_source
  };
  await writeFile(root('analysis.weekly.js'), renderOutputFile(analysis, meta), 'utf8');
  console.log(`Wrote analysis.weekly.js (${analysis.top_spots.length} top spots, ${analysis.spot_notes.length} spot notes).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
