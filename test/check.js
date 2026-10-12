/* Vérifie la cohérence des énigmes, de la boutique et du moteur.
   Lancer : node test/check.js */
const assert = require("assert");
const { ALL_PUZZLES, PUZZLES, CHAPTERS, CHAPTER_PLAN, CATEGORIES } = require("../js/puzzles.js");
const { ITEMS, DECOR_SLOTS, SLOT_NAMES, drawScene, drawGarden, drawPortrait } = require("../js/shop.js");
const G = require("../js/game.js");

const IDS = PUZZLES.map(p => p.id);
const MAIN = PUZZLES.filter(p => !p.bonus);
let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok -", name); };

t("90 énigmes, ids uniques, chacune une seule fois dans le plan", () => {
  assert.strictEqual(ALL_PUZZLES.length, 90);
  assert.strictEqual(new Set(ALL_PUZZLES.map(p => p.id)).size, 90);
  assert.deepStrictEqual(CHAPTER_PLAN.flat().slice().sort(), ALL_PUZZLES.map(p => p.id).sort());
  assert.strictEqual(MAIN.length, 90);
  ALL_PUZZLES.forEach(p => { assert.ok(CATEGORIES[p.cat], p.id + " catégorie"); assert.ok(p.lvl >= 1 && p.lvl <= 5, p.id + " niveau"); });
});

t("15 énigmes par catégorie, 1 ou 2 par chapitre", () => {
  Object.keys(CATEGORIES).forEach(c => {
    assert.strictEqual(MAIN.filter(p => p.cat === c).length, 15, c);
    for (let ch = 1; ch <= 9; ch++) {
      const k = MAIN.filter(p => p.ch === ch && p.cat === c).length;
      assert.ok(k >= 1 && k <= 2, `${c} chapitre ${ch} : ${k}`);
    }
  });
});

t("types équilibrés : 30/30/30, et 3 ou 4 de chaque par chapitre", () => {
  ["find", "fill", "type"].forEach(ty => {
    assert.strictEqual(MAIN.filter(p => p.t === ty).length, 30, ty);
    for (let ch = 1; ch <= 9; ch++) {
      const k = MAIN.filter(p => p.ch === ch && p.t === ty).length;
      assert.ok(k >= 3 && k <= 4, `${ty} chapitre ${ch} : ${k}`);
    }
  });
});

t("9 chapitres de 10, difficulté jamais en baisse dans une catégorie", () => {
  assert.strictEqual(CHAPTER_PLAN.length, 9);
  CHAPTER_PLAN.forEach(ids => assert.strictEqual(ids.length, 10));
  assert.ok(CHAPTERS[9]);
  Object.keys(CATEGORIES).forEach(c => {
    const ps = MAIN.filter(p => p.cat === c);
    ps.forEach((p, i) => { if (i && ps[i - 1].ch < p.ch) assert.ok(p.lvl >= ps[i - 1].lvl, `${c} : ${ps[i - 1].id} → ${p.id}`); });
  });
  const avg = ch => MAIN.filter(p => p.ch === ch).reduce((a, p) => a + p.lvl, 0) / 10;
  assert.ok(avg(9) > avg(1) + 2, "le dernier chapitre est nettement plus difficile que le premier");
});

t("l'histoire commence par p01 et finit par p50", () => {
  assert.strictEqual(PUZZLES[0].id, "p01");
  assert.strictEqual(PUZZLES[89].id, "p50");
});

t("aucun récit ne cite un ancien numéro de chapitre", () => {
  ALL_PUZZLES.forEach(p => assert.ok(!/chapitre/i.test(p.story), p.id));
});

t("chaque énigme est complète et soluble", () => {
  PUZZLES.forEach((p, i) => {
    const id = `#${i + 1} ${p.title}`;
    ["title", "story", "rule"].forEach(k => assert.ok(p[k], id + " " + k));
    assert.ok(p.hints.length >= 2, id + " indices");
    if (p.t === "find"){
      const toks = G.tokens(p);
      const bad = new Set(toks.map((x, k) => x.fix ? k : -1).filter(k => k >= 0));
      assert.ok(bad.size >= 3, id + " au moins 3 fautes");
      assert.ok(toks.every(x => !/[\[\]|]/.test(x.shown)), id + " marqueur mal formé affiché tel quel");
      assert.strictEqual(bad.size, (p.text.match(/\[/g) || []).length, id + " chaque marqueur est reconnu");
      assert.ok(!p.text.match(/\[[^\]]* [^\]]*\]/), id + " pas d'espace dans un marqueur");
      assert.ok(G.checkAnswer(p, bad), id + " solution");
      assert.ok(!G.checkAnswer(p, new Set([...bad].slice(1))), id + " incomplet refusé");
    } else if (p.t === "fill"){
      assert.strictEqual(p.parts.length, p.blanks.length + 1, id + " parts/blanks");
      p.blanks.forEach((b, k) => {
        assert.ok(b.o.includes(b.a), `${id} trou ${k + 1} : réponse dans les options`);
        assert.strictEqual(new Set(b.o).size, b.o.length, `${id} trou ${k + 1} : options uniques`);
      });
      assert.ok(G.checkAnswer(p, p.blanks.map(b => b.a)), id + " solution");
    } else {
      assert.strictEqual(p.t, "type", id + " type connu");
      assert.ok(p.sentence.includes("___") && p.q, id + " phrase");
      assert.ok(G.checkAnswer(p, p.answers[0]), id + " solution");
    }
  });
});

t("première énigme simplifiée (3 fautes)", () => {
  assert.strictEqual(G.tokens(PUZZLES[0]).filter(x => x.fix).length, 3);
});

t("saisie clavier : casse/espaces tolérés, accents exigés", () => {
  const p = PUZZLES.find(x => x.answers && x.answers[0] === "étions");
  assert.ok(G.checkAnswer(p, "  Étions. "));
  assert.ok(!G.checkAnswer(p, "etions"));
  assert.ok(G.checkAnswer({ t: "type", answers: ["l'ai"] }, "l’ai"));
});

t("écus : récompense et pénalité", () => {
  const p = { lvl: 1 };
  assert.strictEqual(G.baseValue(p), 15);
  assert.strictEqual(G.afterMistake(p, 15), 12);
  assert.strictEqual(G.afterMistake(p, 6), 6);
});

t("aucun terme du jeu d'origine", () => {
  const all = JSON.stringify(PUZZLES) + require("fs").readFileSync(__dirname + "/../index.html", "utf8") + require("fs").readFileSync(__dirname + "/../js/game.js", "utf8");
  ["picarat", "layton", "luc ", "luke"].forEach(w => assert.ok(!all.toLowerCase().includes(w), w));
});

t("boutique et dessins", () => {
  assert.strictEqual(new Set(ITEMS.map(i => i.id)).size, ITEMS.length);
  const eq = { hat: "forme", coat: "cape", neck: "noeud", face: "monocle", hand: "loupe" };
  const svg = drawScene(ITEMS.map(i => i.id), eq);
  assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"));
  assert.ok(!/undefined|NaN/.test(svg + drawPortrait({})));
  const garden = drawGarden(ITEMS.map(i => i.id));
  assert.ok(garden.startsWith("<svg") && garden.endsWith("</svg>") && !/undefined|NaN/.test(garden));
  assert.ok(drawGarden([]).startsWith("<svg"), "jardin vide affichable");
});

t("extérieur : objets de jardin et véhicules en vente, tous avec un nom de rubrique", () => {
  assert.ok(ITEMS.filter(i => i.slot === "garden").length >= 6);
  assert.ok(ITEMS.filter(i => i.slot === "vehicle").length >= 2);
  ITEMS.forEach(i => assert.ok(SLOT_NAMES[i.slot], i.id));
  assert.deepStrictEqual(DECOR_SLOTS, ["home", "garden", "vehicle"]);
  // chaque objet de jardin modifie bien le dessin
  ITEMS.filter(i => i.slot === "garden" || i.slot === "vehicle").forEach(i => assert.notStrictEqual(drawGarden([i.id]), drawGarden([]), i.id));
});

t("sauvegarde : export puis import identique", () => {
  const s = { coins: 42, solved: ["p01", "p64", "p90"], owned: ["forme", "chat", "voiture"], equipped: { hat: "forme" } };
  const back = G.importSave(G.exportSave(s), IDS, ITEMS);
  assert.deepStrictEqual(back, s);
});

t("sauvegarde : fichiers invalides refusés, valeurs inconnues ignorées", () => {
  assert.throws(() => G.importSave("pas du json", IDS, ITEMS), /pas une sauvegarde valide/);
  assert.throws(() => G.importSave('{"coins":3}', IDS, ITEMS), /pas une sauvegarde de/);
  assert.throws(() => G.importSave('{"format":"plume-et-cie-save","coins":-5,"solved":[],"owned":[]}', IDS, ITEMS), /abîmée/);
  const s = G.importSave(JSON.stringify({ format: "plume-et-cie-save", coins: 1, solved: ["p04", "p04", "p99", "x"], owned: ["chat", "fusee", "ballon"],
    equipped: { hat: "forme", home: "chat", vehicle: "ballon" } }), IDS, ITEMS);
  assert.deepStrictEqual(s, { coins: 1, solved: ["p04"], owned: ["chat", "ballon"], equipped: {} });
});

t("économie : tout acheter avec 1 indice toutes les 5 questions, dès la fin de l'histoire", () => {
  const gains = MAIN.reduce((a, p) => a + G.baseValue(p), 0) + G.START_COINS;
  const hints = Math.floor(MAIN.length / 5) * G.HINT_COST;
  const shop = ITEMS.reduce((a, i) => a + i.price, 0);
  assert.ok(gains - hints >= shop, `budget ${gains - hints} < boutique ${shop}`);
});

t("économie : avec les bonus, tout est achetable dans le pire des cas (tous les indices, erreurs maximales)", () => {
  const shop = ITEMS.reduce((a, i) => a + i.price, 0);
  const worstGain = PUZZLES.reduce((a, p) => {
    let v = G.baseValue(p);                       // on se trompe jusqu'à ce que la récompense ne baisse plus
    for (let k = 0; k < 20; k++) v = G.afterMistake(p, v);
    return a + v;
  }, G.START_COINS);
  const allHints = PUZZLES.reduce((a, p) => a + p.hints.length * G.HINT_COST, 0);
  assert.ok(worstGain - allHints >= shop, `pire cas ${worstGain - allHints} < boutique ${shop}`);
});

t("bonus : 10 mystères difficiles après l'histoire, récompense fixe", () => {
  const bonus = PUZZLES.filter(p => p.bonus);
  assert.strictEqual(bonus.length, 10);
  assert.deepStrictEqual(PUZZLES.slice(90).map(p => p.id), bonus.map(p => p.id), "après les 90 mystères");
  bonus.forEach(p => { assert.strictEqual(p.ch, 10); assert.strictEqual(p.lvl, 5); assert.strictEqual(G.afterMistake(p, p.reward), p.reward); });
  assert.ok(CHAPTERS[10].includes("Bonus"));
  assert.ok(G.baseValue(bonus[0]) > G.baseValue(MAIN[89]), "un bonus rapporte plus qu'un mystère normal");
});

t("ancienne sauvegarde (positions 0..49) convertie en identifiants", () => {
  assert.deepStrictEqual(G.migrateSolved([0, 9, 49, "p70"]), ["p01", "p10", "p50", "p70"]);
  const old = JSON.stringify({ format: "plume-et-cie-save", version: 1, coins: 7, solved: [0, 1, 2], owned: [], equipped: {} });
  assert.deepStrictEqual(G.importSave(old, IDS, ITEMS).solved, ["p01", "p02", "p03"]);
});

t("mode test : la solution fournie valide chacune des 100 énigmes", () => {
  PUZZLES.forEach((p, i) => assert.ok(G.checkAnswer(p, G.solutionFor(p)), "#" + (i + 1)));
  assert.strictEqual(G.TEST_PASSWORD, "tes1");
});

console.log(`\n${n} tests OK`);
