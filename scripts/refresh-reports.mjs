#!/usr/bin/env node
// Pulls the latest fishing report from each guide's own site and rewrites
// reports.auto.js. No AI involved — this is plain extraction of text that's
// already public on each site, run daily by
// .github/workflows/refresh-reports.yml. If a site's page structure changes
// enough to break the regex below, this just leaves that source's entry as
// it was (logged as a warning) rather than writing garbage.

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

function cleanText(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&(ndash|mdash|hellip|rsquo|lsquo|rdquo|ldquo|quot|apos|lt|gt);/g, (_, n) =>
      ({ ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', quot: '"', apos: "'", lt: '<', gt: '>' })[n])
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractWaterTemp(text) {
  const m = text.match(/Water temps?:?\s*(\d{2}-\d{2})/i);
  return m ? m[1].replace('-', '–') : null;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'lake-vermilion-app-report-refresh/1.0' } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

async function scrapeFishingWithZ() {
  const listUrl = 'https://fishingwithz.com/fishing-reports/';
  const html = await fetchText(listUrl);
  const m = html.match(/<h2><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h2>[\s\S]*?<p>Posted ([^<]+)<\/p>[\s\S]*?<p>([^<]+)<\/p>/);
  if (!m) { console.warn('Fishing with Z: pattern not found, skipping'); return null; }
  const [, link, , dateStr, excerpt] = m;
  const iso = new Date(dateStr.trim()).toISOString().slice(0, 10);
  const rawText = cleanText(excerpt);
  return {
    date: iso,
    source: 'Fishing with Z (Zach Hrvol)',
    sourceUrl: link,
    waterTempF: extractWaterTemp(rawText),
    rawText
  };
}

async function scrapePatriotGuide() {
  const listUrl = 'https://www.patriotguideserviceoflakevermilion.com/fishing-reports/';
  const html = await fetchText(listUrl);
  // This listing page mixes weekly reports with evergreen blog posts in the same
  // carousel widget, so filter to titles that actually look like a dated report
  // before picking the most recent one.
  const re = /itemid="([^"]+)" content="([^"]+)" \/><meta itemprop="datePublished" content="([^"]+)"/g;
  const all = [...html.matchAll(re)].map(m => ({ link: m[1], title: m[2], date: m[3] }));
  const reports = all.filter(a => /^\d{2}\/\d{2}\/\d{2} Lake Vermilion Fishing Report$/.test(a.title));
  if (reports.length === 0) { console.warn('Patriot Guide Service: no dated reports found, skipping'); return null; }
  reports.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = reports[0];
  const titleMatch = latest.title.match(/^(\d{2})\/(\d{2})\/(\d{2})/);
  const reportDate = titleMatch ? `20${titleMatch[3]}-${titleMatch[1]}-${titleMatch[2]}` : latest.date.slice(0, 10);

  const postHtml = await fetchText(latest.link);
  const paraMatches = [...postHtml.matchAll(/<p class="wp-block-paragraph">([\s\S]*?)<\/p>/g)];
  if (paraMatches.length === 0) { console.warn('Patriot Guide Service: post body not found, skipping'); return null; }
  const rawText = cleanText(paraMatches.map(p => p[1]).join(' '));
  return {
    date: reportDate,
    source: 'Patriot Guide Service (Justin Chromy)',
    sourceUrl: latest.link,
    waterTempF: extractWaterTemp(rawText),
    rawText
  };
}

// Keep a rolling history instead of only the latest post per guide: merge new
// scrapes into what's already in reports.auto.js, de-duplicated by URL, keeping
// the newest few per source within a retention window. The app itself still only
// displays the recent ones (REPORT_MAX_AGE_DAYS), but history is retained for it.
const KEEP_PER_SOURCE = 6;
const KEEP_DAYS = 120;

async function loadExistingReports() {
  try {
    const text = await readFile(new URL('../reports.auto.js', import.meta.url), 'utf8');
    const m = text.match(/const AUTO_REPORTS = (\[[\s\S]*?\]);\s*$/);
    return m ? JSON.parse(m[1]) : [];
  } catch {
    return [];
  }
}

export function mergeReports(existing, fresh, now = Date.now()) {
  const byUrl = new Map();
  for (const r of [...existing, ...fresh]) byUrl.set(r.sourceUrl, r); // fresh wins
  const perSource = {};
  return [...byUrl.values()]
    .filter(r => now - new Date(r.date).getTime() <= KEEP_DAYS * 86400000)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(r => (perSource[r.source] = (perSource[r.source] || 0) + 1) <= KEEP_PER_SOURCE);
}

async function main() {
  const results = await Promise.allSettled([scrapeFishingWithZ(), scrapePatriotGuide()]);
  const reports = [];
  const sourceStatus = [];
  const sourceNames = ['Fishing with Z', 'Patriot Guide Service'];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      reports.push(r.value);
      sourceStatus.push({ source: sourceNames[i], ok: true });
    } else {
      const reason = r.status === 'rejected' ? (r.reason?.message || String(r.reason)) : 'pattern not found';
      console.warn(`${sourceNames[i]}: ${reason}`);
      sourceStatus.push({ source: sourceNames[i], ok: false, error: reason });
    }
  });

  // reports.checked.js always gets rewritten, every run, whether or not anything
  // new was found — it's just proof the daily job actually executed, so "did this
  // run today" is answerable at a glance instead of only inferable from whether
  // report content happened to change.
  const checkedBody = `// Auto-generated by scripts/refresh-reports.mjs — always rewritten on every run\n` +
    `// (unlike reports.auto.js, which only changes when new report content is found).\n` +
    `// Use this to confirm the daily refresh actually ran, independent of whether\n` +
    `// either guide had posted anything new.\n` +
    `const REPORTS_CHECKED_AT = ${JSON.stringify(new Date().toISOString())};\n` +
    `const REPORTS_CHECK_STATUS = ${JSON.stringify(sourceStatus, null, 2)};\n`;
  await writeFile(new URL('../reports.checked.js', import.meta.url), checkedBody, 'utf8');

  if (reports.length === 0) {
    console.error('No reports scraped successfully from either source — leaving reports.auto.js untouched.');
    return;
  }

  const merged = mergeReports(await loadExistingReports(), reports);

  const body = `// Auto-generated by scripts/refresh-reports.mjs (GitHub Actions workflow\n` +
    `// .github/workflows/refresh-reports.yml, runs daily). Do not hand-edit — your\n` +
    `// changes will be overwritten on the next run. This is raw, unedited text\n` +
    `// scraped directly from each guide's own site — no AI summarizing involved.\n` +
    `const AUTO_REPORTS = ${JSON.stringify(merged, null, 2)};\n`;

  await writeFile(new URL('../reports.auto.js', import.meta.url), body, 'utf8');
  console.log(`Wrote reports.auto.js with ${merged.length} report(s).`);
}

// Only run when executed directly (so mergeReports can be imported for tests).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
