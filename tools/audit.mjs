// Inhalts-Prüfung: Ist jede Station abwechslungsreich und nicht zu leicht?
// Aufruf (im Projektordner):  node tools/audit.mjs
//
// Für jede Station und jede Stufe werden 300 Runden erzeugt und gezählt:
//  - wie viele VERSCHIEDENE Aufgaben ein Kind bekommt (Abwechslung)
//  - wie viele Antworten zur Auswahl stehen (zwei Bilder sind schnell geraten)
// Unterschreitet eine Station die Mindestwerte, schlägt die Prüfung fehl.
// Das prüft, was der Durchspiel-Test nicht sieht: ob die Inhalte reichen.

// Kein Browser: Speicher und Dokument nachbilden, so weit die Spiele sie beim Erzeugen brauchen.
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const { PLACES, PLACE_ORDER } = await import('../js/content/places.js');
const GAMES = {
  zaehlen: (await import('../js/games/zaehlen.js')).zaehlen,
  spuren: (await import('../js/games/spuren.js')).spuren,
  wald: (await import('../js/games/wald.js')).wald,
};

// Mindestwerte: so viele verschiedene Aufgaben je Stufe; so viele Antworten zur Auswahl.
const MIN_DISTINCT = [6, 8, 8, 10];
const MIN_CHOICES = [2, 3, 3, 3];
const ROUNDS = 300;

let problems = 0;
const rows = [];
for (const pid of PLACE_ORDER) {
  const pl = PLACES[pid];
  if (!pl.built) continue;
  for (const st of pl.stations) {
    const game = GAMES[st.game];
    const line = [];
    // „Mein Name": der Inhalt ist der Name des Kindes – fest, nicht zufällig.
    if (st.needsName) { rows.push(`${(pl.name + ': ' + st.title).padEnd(38)} fester Inhalt (Name aus dem Elternbereich)`); continue; }
    for (let step = 0; step < 4; step++) {
      const seen = new Set();
      let minChoices = Infinity, tasks = 0, ruleBroken = null;
      for (let r = 0; r < ROUNDS; r++) {
        const list = game.makeTasks({ ...st.opts, name: 'LENA' }, step);
        tasks = list.length;
        for (const t of list) {
          seen.add(game.sig ? game.sig(t) : JSON.stringify(t));
          const err = game.check && game.check(t);
          if (err) ruleBroken = err;
          const c = game.choices ? game.choices(t) : null;
          if (c !== null && c !== undefined) minChoices = Math.min(minChoices, c);
        }
      }
      const distinct = seen.size;
      const flags = [];
      if (distinct < MIN_DISTINCT[step]) flags.push(`nur ${distinct} verschiedene Aufgaben`);
      if (minChoices !== Infinity && minChoices < MIN_CHOICES[step]) flags.push(`nur ${minChoices} Antworten`);
      if (ruleBroken) flags.push(ruleBroken);
      if (flags.length) { problems++; line.push(`S${step + 1}: ✗ ${flags.join(', ')}`); }
      else line.push(`S${step + 1}: ${distinct}${minChoices !== Infinity ? '/' + minChoices : ''}`);
    }
    rows.push(`${(pl.name + ': ' + st.title).padEnd(38)} ${line.join('   ')}`);
  }
}
console.log('Station'.padEnd(38), 'je Stufe: verschiedene Aufgaben / Antworten zur Auswahl');
console.log(rows.join('\n'));
console.log(problems ? `\n${problems} Mal zu dünn oder zu leicht.` : '\nAlle Stationen abwechslungsreich genug.');
process.exit(problems ? 1 : 0);
