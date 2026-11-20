// Alles, was Fips sagt. Kurze Sätze, höchstens acht Wörter.
// Aus dieser Datei erzeugt tools/list-texts.mjs die Liste für die Sprach-Clips –
// deshalb steht hier jeder Satz, der je gesprochen wird, auch die zusammengesetzten.
// Kein DOM, kein Browser: wird auch von Node gelesen.

export const NUM = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben',
  'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn',
  'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig'];

// Zahlwort vor einem Nomen: „ein Apfel", „zwei Äpfel"
const ART = { m: 'ein', n: 'ein', f: 'eine' };
const ART_AKK = { m: 'einen', n: 'ein', f: 'eine' };

/** Dinge zum Zählen. g: Geschlecht, one/many: Einzahl/Mehrzahl. */
export const THINGS = {
  edelstein: { g: 'm', one: 'Edelstein', many: 'Edelsteine' },
  apfel: { g: 'm', one: 'Apfel', many: 'Äpfel' },
  hufeisen: { g: 'n', one: 'Hufeisen', many: 'Hufeisen' },
  krone: { g: 'f', one: 'Krone', many: 'Kronen' },
};

const amount = (n, thing, akk = false) => {
  const t = THINGS[thing];
  if (n === 1) return `${(akk ? ART_AKK : ART)[t.g]} ${t.one}`;
  return `${NUM[n]} ${t.many}`;
};
const cap = s => s[0].toUpperCase() + s.slice(1);

export const T = {
  // Start und Figur
  // Was zusammengehört, steht in EINEM Satz-Clip: dann klingt es wie gesprochen statt zusammengestückelt.
  intro: 'Hallo! Ich bin Fips, der kleine Drache. Wer bist du? Tippe auf dich!',
  story: 'Auf der Burg gibt es bald ein Fest. Hilfst du mir beim Vorbereiten? Für jede Hilfe gibt es ein Geschenk.',

  // Karte
  map: 'Wohin gehen wir? Tippe auf einen Ort!',
  map_again: 'Wohin gehen wir jetzt?',
  baustelle: 'Hier wird noch gebaut. Bald geht es los!',

  // Orte
  place_again: 'Was spielen wir jetzt?',

  // In der Runde
  praise: ['Super!', 'Genau!', 'Toll gemacht!', 'Prima!', 'Klasse!', 'Juhu!'],
  retry: ['Hm, schau noch mal!', 'Fast! Probier es noch mal.', 'Noch mal gucken!'],
  hint: 'Schau mal, hier!',
  slow: 'Langsam! Schau mal genau.',

  // Schatztruhe
  chest: 'Eine Schatztruhe! Such dir ein Geschenk aus.',
  chest_one: 'Probier doch mal was anderes!',
  chest_first: 'Ein Geschenk für deinen ersten Besuch!',
  gem: 'Ein Edelstein für deine Schatztruhe!',

  // Burg
  castle_go: 'Deine Burg!',
  castle: 'Das ist deine Burg!',
  castle_empty: 'Das ist deine Burg! Noch ist sie leer. Spiel und sammle Geschenke!',
  castle_many: 'So viele Edelsteine!',

  // Abschied
  pause: 'Ich bin müde. Ich gehe jetzt schlafen. Bis morgen!',

  // Schatzkammer
  zaehlen: 'Tippe alle an. Wir zählen zusammen!',
  wieviele: 'Wie viele sind es?',
  genau: n => `Genau, ${NUM[n]}!`,
  einpacken: (n, thing) => `Leg ${amount(n, thing, true)} in die Schatulle.`,
  eingepackt: (n, thing) => `Super, ${amount(n, thing)}!`,
  genug: 'Das ist genug!',
  fertig: 'Fertig? Dann tippe auf den Haken.',
  zuviel: 'Das sind zu viele. Tippe einen an, dann kommt er heraus.',
  zuwenig: 'Da fehlen noch welche. Zähl noch mal!',
  zahl_welche: 'Welche Zahl ist das?',
  soviele: 'Wo sind so viele?',
  dazu_look: 'Schau gut zu!',
  dazu: { plus1: 'Einer kommt dazu!', plus2: 'Zwei kommen dazu!', minus1: 'Einer geht weg!', minus2: 'Zwei gehen weg!' },
  jetzt: 'Wie viele sind es jetzt?',
  blick: 'Wo sind genauso viele?',
  mehr: 'Wo sind mehr?',
  weniger: 'Wo sind weniger?',
  mehr_gleich: 'Wo sind mehr? Oder gleich viele?',
  gleich: 'Gleich viele!',
  ordnen: 'Ich lege sie in die Schatulle.',

  // Schreibturm
  weg: 'Fahr den Weg mit dem Finger nach.',
  weg_start: 'Fang bei mir an!',
  weiter: 'Und jetzt hier weiter!',
  formen: {
    kreis: 'Mal einen Kreis!', kreuz: 'Mal ein Kreuz!', ei: 'Mal ein Ei!', schnecke: 'Mal ein Schneckenhaus!', mond: 'Mal einen Mond!',
    sonne: 'Mal eine Sonne!', ballon: 'Mal einen Luftballon!', schneemann: 'Mal einen Schneemann!', quadrat: 'Mal ein Quadrat!',
    dreieck: 'Mal ein Dreieck!', rechteck: 'Mal eine Tür!', raute: 'Mal einen Edelstein!', haus: 'Mal ein Haus!', fahne: 'Mal eine Fahne!',
    turm: 'Mal einen Turm!', stern: 'Mal einen Stern!', herz: 'Mal ein Herz!', tanne: 'Mal eine Tanne!',
  },
  formen_done: {
    kreis: 'Ein Kreis!', kreuz: 'Ein Kreuz!', ei: 'Ein Ei!', schnecke: 'Ein Schneckenhaus!', mond: 'Ein Mond!', sonne: 'Eine Sonne!',
    ballon: 'Ein Luftballon!', schneemann: 'Ein Schneemann!', quadrat: 'Ein Quadrat!', dreieck: 'Ein Dreieck!', rechteck: 'Eine Tür!',
    raute: 'Ein Edelstein!', haus: 'Ein Haus!', fahne: 'Eine Fahne!', turm: 'Ein Turm!', stern: 'Ein Stern!', herz: 'Ein Herz!', tanne: 'Eine Tanne!',
  },
  buchstabe: L => `Mal das ${L}!`,
  buchstabe_done: L => (LETTER_WORDS[L] ? `${L} wie ${LETTER_WORDS[L][0]}!` : `Das ist das ${L}!`),
  name: 'Wir schreiben deinen Namen!',
  name_done: 'Das ist dein Name!',

  // Zauberwald
  farben: 'Leg die Edelsteine in die passende Truhe.',
  farbe: { rot: 'Rot!', blau: 'Blau!', gelb: 'Gelb!', gruen: 'Grün!', lila: 'Lila!' },
  paare: 'Welcher Schild sieht genauso aus?',
  schatten: 'Wer gehört zu welchem Schatten?',
  memory: 'Finde die Paare!',
  memory_look: 'Schau gut hin!',
  passt: 'Was passt nicht dazu?',
  muster: 'Welche Fahne kommt als Nächstes?',
  ablauf2: 'Was war zuerst?',
  ablauf3: 'Was kommt zuerst? Und dann?',
};

/** Anlaut-Wörter zu Buchstaben, für die es ein Bild gibt: Buchstabe -> [Wort, Bild-id]. */
export const LETTER_WORDS = {
  A: ['Apfel', 'apfel'], B: ['Brunnen', 'brunnen'], E: ['Ente', 'ente'], F: ['Fee', 'fee'], H: ['Hund', 'hund'], I: ['Igel', 'igel'],
  K: ['Krone', 'krone'], P: ['Pony', 'pony'], R: ['Rose', 'rose'], S: ['Sonnenblume', 'sonnenblume'], T: ['Tulpe', 'tulpe'], W: ['Wimpel', 'wimpel'],
};
export const LETTER_LIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');

/** Figuren: id, wie Fips sie anspricht. */
export const FIGURES = {
  ritterin: { name: 'Ritterin', you: 'Du bist die Ritterin!', hi: 'Hallo, Ritterin!' },
  ritter: { name: 'Ritter', you: 'Du bist der Ritter!', hi: 'Hallo, Ritter!' },
  prinzessin: { name: 'Prinzessin', you: 'Du bist die Prinzessin!', hi: 'Hallo, Prinzessin!' },
  prinz: { name: 'Prinz', you: 'Du bist der Prinz!', hi: 'Hallo, Prinz!' },
};

/** „Du hast sieben Edelsteine!" – bis zwanzig, darüber „So viele Edelsteine!" */
export const gemsText = n => (n <= 20 ? (n === 1 ? 'Du hast einen Edelstein!' : `Du hast ${NUM[n]} Edelsteine!`) : T.castle_many);

/** „Das Pony kommt in deine Burg!" */
export const giftText = gift => `${cap(gift.the)} kommt in deine Burg!`;
/** „Das Pony!" beim Antippen in der Burg */
export const giftName = gift => `${cap(gift.the)}!`;
/** Geschenk und Hinweis in EINEM Satz-Clip: „Das Pony kommt in deine Burg! Probier doch mal was anderes!" */
export const giftMore = gift => `${giftText(gift)} ${T.chest_one}`;
export const gemMore = () => `${T.gem} ${T.chest_one}`;

/** Jeder Satz, der je gesprochen werden kann (für tools/gen-audio.py). */
export function allTexts(extra = []) {
  const out = [];
  const add = v => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(add);
    else if (v && typeof v === 'object') Object.values(v).forEach(add);
  };
  add(Object.values(T).filter(v => typeof v !== 'function'));
  add(NUM.slice(1));
  for (let n = 1; n <= 20; n++) add(T.genau(n));
  for (let n = 1; n <= 20; n++) for (const thing of Object.keys(THINGS)) { add(T.einpacken(n, thing)); add(T.eingepackt(n, thing)); }
  for (let n = 1; n <= 21; n++) add(gemsText(n));
  for (const L of LETTER_LIST) add([T.buchstabe(L), T.buchstabe_done(L)]);
  add(gemMore());
  Object.values(FIGURES).forEach(f => add([f.you, f.hi]));
  add(extra);
  return [...new Set(out)];
}
