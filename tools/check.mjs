// Schnelle Prüfung vor dem Einchecken:  node tools/check.mjs
// - Ist assets/audio/texts.json aktuell (sonst: node tools/list-texts.mjs)?
// - Stehen alle Dateien im Service Worker (sonst fehlen sie offline)?
// - Sind alle Sätze kurz genug (höchstens acht Wörter)?
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { texts } from './list-texts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let problems = 0;
const fail = msg => { problems++; console.log('✗ ' + msg); };

const saved = JSON.parse(readFileSync(join(ROOT, 'assets/audio/texts.json'), 'utf8'));
const now = texts();
if (JSON.stringify(saved) !== JSON.stringify(now)) fail('assets/audio/texts.json ist veraltet – bitte `node tools/list-texts.mjs` ausführen.');
const long = now.filter(t => t.split(/\s+/).length > 8);
if (long.length) fail('Sätze mit mehr als acht Wörtern: ' + long.join(' | '));

const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const walk = dir => readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
for (const f of [...walk(join(ROOT, 'js')), join(ROOT, 'css/app.css')]) {
  const rel = relative(ROOT, f);
  if (!sw.includes(`'${rel}'`)) fail(`${rel} fehlt in sw.js (CORE) – und CACHE hochzählen.`);
}
console.log(problems ? `${problems} Problem(e).` : `Alles in Ordnung (${now.length} Sätze).`);
process.exit(problems ? 1 : 0);
