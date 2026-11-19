// Schreibt alle Sätze, die Fips sagen kann, nach assets/audio/texts.json.
// Aufruf (im Projektordner):  node tools/list-texts.mjs
// Danach auf dem Mac:          python3 tools/gen-audio.py
// tools/check.mjs prüft, ob die Liste noch zu den Inhalten passt.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { allTexts, giftText, giftName } from '../js/content/texts.js';
import { allPlaceTexts } from '../js/content/places.js';
import { GIFTS, GEM } from '../js/content/castle.js';

export function texts() {
  return allTexts([...allPlaceTexts(), ...GIFTS.flatMap(g => [giftText(g), giftName(g)]), giftName(GEM)]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'audio', 'texts.json');
  const list = texts();
  writeFileSync(out, JSON.stringify(list, null, 1) + '\n');
  console.log(`${list.length} Sätze nach assets/audio/texts.json geschrieben.`);
}
