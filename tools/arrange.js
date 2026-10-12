/* Génère l'ordre de jeu (CHAPTER_PLAN) dans js/puzzles.js.
   Lancer : node tools/arrange.js
   Contraintes :
   - 9 chapitres de 10 énigmes ;
   - chaque catégorie (15 énigmes) a 1 ou 2 énigmes par chapitre ;
   - chaque type (30 énigmes) a 3 ou 4 énigmes par chapitre ;
   - dans une catégorie, la difficulté ne baisse jamais d'un chapitre à l'autre ;
   - p01 (début de l'histoire) ouvre le jeu, p50 (manuscrit retrouvé) le termine.
   Le résultat est déterministe (graine fixe). */
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "js", "puzzles.js");
const { ALL_PUZZLES, CATEGORIES } = require(FILE);

const NCH = 9, CATS = Object.keys(CATEGORIES), TYPES = ["find", "fill", "type"];
const FIRST = "p01", LAST = "p50";

let seed = 42;
const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const byCat = {};
CATS.forEach(c => byCat[c] = ALL_PUZZLES.filter(p => p.cat === c)
  .sort((a, b) => a.lvl - b.lvl || a.id.localeCompare(b.id)));

/* Combien d'énigmes de chaque catégorie par chapitre : 4 catégories à 2, 2 à 1 ;
   chaque catégorie a exactement 3 chapitres « à 1 ». */
function slotPlan(){
  for (;;) {
    const singles = shuffle(CATS.flatMap(c => [c, c, c]));
    const plan = [];
    let ok = true;
    for (let ch = 0; ch < NCH; ch++) {
      const pair = singles.slice(ch * 2, ch * 2 + 2);
      if (pair[0] === pair[1]) { ok = false; break; }
      plan.push(Object.fromEntries(CATS.map(c => [c, pair.includes(c) ? 1 : 2])));
    }
    if (ok) return plan;
  }
}

/* Remplit les chapitres dans l'ordre de difficulté, catégorie par catégorie.
   Les énigmes de même niveau sont mélangées (cela ne casse pas la progression). */
function fill(plan){
  const chapters = Array.from({ length: NCH }, () => []);
  CATS.forEach(c => {
    const groups = {};
    byCat[c].forEach(p => (groups[p.lvl] = groups[p.lvl] || []).push(p));
    const list = Object.keys(groups).sort().flatMap(l => shuffle(groups[l].slice()));
    // début et fin de l'histoire : en tête / en queue de leur catégorie (même niveau, donc sans casser la progression)
    [[FIRST, 0], [LAST, list.length - 1]].forEach(([id, pos]) => {
      const i = list.findIndex(p => p.id === id);
      if (i >= 0) list.splice(pos, 0, list.splice(i, 1)[0]);
    });
    let k = 0;
    plan.forEach((counts, ch) => { for (let i = 0; i < counts[c]; i++) chapters[ch].push(list[k++]); });
  });
  return chapters;
}

function cost(chapters){
  let c = 0;
  chapters.forEach(ch => TYPES.forEach(t => {
    const n = ch.filter(p => p.t === t).length;
    if (n < 3) c += 3 - n; if (n > 4) c += n - 4;
  }));
  if (!chapters[0].some(p => p.id === FIRST)) c += 10;
  if (!chapters[NCH - 1].some(p => p.id === LAST)) c += 10;
  return c;
}

/* Recherche locale : échange deux énigmes de même catégorie et même niveau entre deux chapitres. */
function improve(chapters){
  let c = cost(chapters), progress = true;
  while (progress && c > 0) {
    progress = false;
    for (let a = 0; a < NCH && !progress; a++) for (let b = a + 1; b < NCH && !progress; b++)
      for (let i = 0; i < chapters[a].length && !progress; i++) for (let j = 0; j < chapters[b].length && !progress; j++) {
        const x = chapters[a][i], y = chapters[b][j];
        if (x.cat !== y.cat || x.lvl !== y.lvl || x.t === y.t || [x.id, y.id].some(id => id === FIRST || id === LAST)) continue;
        chapters[a][i] = y; chapters[b][j] = x;
        const n = cost(chapters);
        if (n < c) { c = n; progress = true; } else { chapters[a][i] = x; chapters[b][j] = y; }
      }
  }
  return c;
}

let best = null, bestCost = Infinity;
for (let tries = 0; tries < 20000 && bestCost > 0; tries++) {
  const ch = fill(slotPlan());
  const c = improve(ch);
  if (c < bestCost) { best = ch; bestCost = c; }
}
if (bestCost > 0) { console.error("Aucune répartition valide trouvée (coût " + bestCost + ")"); best.forEach((ch, i) => console.error(i + 1, TYPES.map(t => t + ":" + ch.filter(p => p.t === t).map(p => p.id + "/" + p.cat.slice(0, 4) + p.lvl).join(" ")).join(" | "))); process.exit(1); }

/* Dans un chapitre : difficulté croissante, en alternant les types autant que possible. */
const plan = best.map(ch => {
  const sorted = ch.slice().sort((a, b) => a.lvl - b.lvl || a.id.localeCompare(b.id));
  const out = [];
  while (sorted.length) {
    const prev = out[out.length - 1];
    const i = sorted.findIndex(p => !prev || p.t !== prev.t);
    out.push(sorted.splice(i < 0 ? 0 : i, 1)[0]);
  }
  return out.map(p => p.id);
});
const pin = (ids, id, first) => { ids.splice(ids.indexOf(id), 1); first ? ids.unshift(id) : ids.push(id); };
pin(plan[0], FIRST, true);
pin(plan[NCH - 1], LAST, false);

const text = "const CHAPTER_PLAN = [\n" + plan.map(ids => "  [" + ids.map(i => `"${i}"`).join(",") + "]").join(",\n") + "\n];";
const src = fs.readFileSync(FILE, "utf8").replace(/const CHAPTER_PLAN = \[[\s\S]*?\];/, text);
fs.writeFileSync(FILE, src);
console.log(text);
