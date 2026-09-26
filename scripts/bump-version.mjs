#!/usr/bin/env node
// Rewrites the ?v=<hash> cache-busting query strings in index.html from each
// file's content, so nobody has to bump them by hand (and they only change when
// the file actually changed). Run by .github/workflows/cache-bust.yml on push.

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const FILES = ['style.css', 'app.js', 'data.js'];
const indexUrl = new URL('../index.html', import.meta.url);
let html = await readFile(indexUrl, 'utf8');

for (const f of FILES) {
  const buf = await readFile(new URL(`../${f}`, import.meta.url));
  const v = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const re = new RegExp(`(${f.replace('.', '\\.')})\\?v=[A-Za-z0-9]+`);
  if (!re.test(html)) { console.warn(`${f}: no ?v= reference found in index.html`); continue; }
  html = html.replace(re, `$1?v=${v}`);
  console.log(`${f} -> ?v=${v}`);
}
await writeFile(indexUrl, html, 'utf8');
