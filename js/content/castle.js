// Geschenke für die eigene Burg. Jedes hat einen festen Platz (siehe js/art/castle.js),
// einen Klang und eine kleine Bewegung beim Antippen.
// the: wie Fips es nennt („die rote Fahne kommt in deine Burg").
// first: Geschenk für den ersten Besuch dieses Ortes (kommt nicht in die normale Truhe).
export const GIFTS = [
  // Fahnen
  { id: 'fahne-rot', cat: 'fahne', the: 'die rote Fahne', sound: 'flap', anim: 'flutter' },
  { id: 'fahne-blau', cat: 'fahne', the: 'die blaue Fahne', sound: 'flap', anim: 'flutter' },
  { id: 'fahne-gelb', cat: 'fahne', the: 'die gelbe Fahne', sound: 'flap', anim: 'flutter' },
  { id: 'fahne-gruen', cat: 'fahne', the: 'die grüne Fahne', sound: 'flap', anim: 'flutter' },
  { id: 'fahne-stern', cat: 'fahne', the: 'die Sternenfahne', sound: 'sparkle', anim: 'flutter' },
  { id: 'fahne-herz', cat: 'fahne', the: 'die Herzfahne', sound: 'sparkle', anim: 'flutter' },
  { id: 'wimpel', cat: 'fahne', the: 'die Wimpelkette', sound: 'chime', anim: 'swing' },
  // Tiere
  { id: 'pony', cat: 'tier', the: 'das Pony', sound: 'hop', anim: 'hop' },
  { id: 'hund', cat: 'tier', the: 'der Hund', sound: 'boing', anim: 'hop' },
  { id: 'katze', cat: 'tier', the: 'die Katze', sound: 'boing', anim: 'wiggle' },
  { id: 'huhn', cat: 'tier', the: 'das Huhn', sound: 'flap', anim: 'hop' },
  { id: 'ente', cat: 'tier', the: 'die Ente', sound: 'splash', anim: 'swim' },
  { id: 'schwan', cat: 'tier', the: 'der Schwan', sound: 'splash', anim: 'swim' },
  { id: 'eule', cat: 'tier', the: 'die Eule', sound: 'flap', anim: 'wiggle' },
  { id: 'igel', cat: 'tier', the: 'der Igel', sound: 'boing', anim: 'wiggle' },
  { id: 'hase', cat: 'tier', the: 'der Hase', sound: 'hop', anim: 'hop' },
  // Garten
  { id: 'rose', cat: 'garten', the: 'die Rose', sound: 'chime', anim: 'wiggle' },
  { id: 'sonnenblume', cat: 'garten', the: 'die Sonnenblume', sound: 'chime', anim: 'wiggle' },
  { id: 'tulpe', cat: 'garten', the: 'die Tulpe', sound: 'chime', anim: 'wiggle' },
  { id: 'apfelbaum', cat: 'garten', the: 'der Apfelbaum', sound: 'boing', anim: 'wiggle' },
  { id: 'kuerbis', cat: 'garten', the: 'der Kürbis', sound: 'boing', anim: 'hop' },
  { id: 'pilz', cat: 'garten', the: 'der Pilz', sound: 'boing', anim: 'hop' },
  { id: 'brunnen', cat: 'garten', the: 'der Brunnen', sound: 'splash', anim: 'wiggle' },
  // Erster Besuch eines Ortes
  { id: 'krone', cat: 'besonders', the: 'die goldene Krone', sound: 'sparkle', anim: 'spin', first: 'zahl' },
  { id: 'feder', cat: 'besonders', the: 'die Schreibfeder', sound: 'sparkle', anim: 'flutter', first: 'schreib' },
  { id: 'fee', cat: 'besonders', the: 'die kleine Fee', sound: 'sparkle', anim: 'hop', first: 'wald' },
];

export const giftById = id => GIFTS.find(g => g.id === id);

/** Ersatz, wenn alles gesammelt ist: ein Edelstein für die Schatztruhe der Burg. */
export const GEM = { id: 'edelstein', cat: 'edelstein', the: 'ein Edelstein' };

/**
 * Was in der Truhe liegt: bis zu count Geschenke, möglichst aus verschiedenen Kategorien,
 * die das Kind noch nicht hat. Ist alles gesammelt, liegt ein Edelstein darin.
 */
export function offerGifts(owned, count = 3) {
  const free = GIFTS.filter(g => !g.first && !owned[g.id]);
  if (!free.length) return [GEM];
  const byCat = {};
  for (const g of free) (byCat[g.cat] = byCat[g.cat] || []).push(g);
  const cats = Object.keys(byCat).sort(() => Math.random() - 0.5);
  const out = [];
  // Erst je Kategorie eins, dann auffüllen.
  for (let round = 0; out.length < count && round < 10; round++) {
    for (const c of cats) {
      const list = byCat[c].filter(g => !out.includes(g));
      if (list.length && out.length < count) out.push(list[Math.floor(Math.random() * list.length)]);
    }
    if (out.length === free.length) break;
  }
  return out;
}

/** Geschenk für den ersten Besuch eines Ortes (oder null). */
export const firstGift = (place, owned) => GIFTS.find(g => g.first === place && !owned[g.id]) || null;
