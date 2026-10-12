/* Vérifie la cohérence des énigmes, de la boutique et du moteur.
   Lancer : node test/check.js */
const assert = require("assert");
const { PUZZLES, CHAPTERS } = require("../js/puzzles.js");
const { ITEMS, drawScene, drawPortrait } = require("../js/shop.js");
const G = require("../js/game.js");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok -", name); };

t("50 énigmes, 10 par chapitre, difficulté croissante", () => {
  assert.strictEqual(PUZZLES.length, 50);
  for (let c = 1; c <= 5; c++) assert.strictEqual(PUZZLES.filter(p => p.ch === c).length, 10, "chapitre " + c);
  PUZZLES.forEach((p, i) => { if (i) assert.ok(p.ch >= PUZZLES[i - 1].ch, "ordre chapitre à " + (i + 1)); });
  assert.ok(CHAPTERS[5]);
});

t("un tiers des 48 nouvelles énigmes est à taper au clavier", () => {
  assert.strictEqual(PUZZLES.filter(p => p.t === "type").length, 16);
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
  const p = { ch: 1 };
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
});

t("sauvegarde : export puis import identique", () => {
  const s = { coins: 42, solved: [0, 1, 2], owned: ["forme", "chat"], equipped: { hat: "forme" } };
  const back = G.importSave(G.exportSave(s), PUZZLES.length, ITEMS);
  assert.deepStrictEqual(back, s);
});

t("sauvegarde : fichiers invalides refusés, valeurs inconnues ignorées", () => {
  assert.throws(() => G.importSave("pas du json", 50, ITEMS), /pas une sauvegarde valide/);
  assert.throws(() => G.importSave('{"coins":3}', 50, ITEMS), /pas une sauvegarde de/);
  assert.throws(() => G.importSave('{"format":"plume-et-cie-save","coins":-5,"solved":[],"owned":[]}', 50, ITEMS), /abîmée/);
  const s = G.importSave(JSON.stringify({ format: "plume-et-cie-save", coins: 1, solved: [3, 3, 99, "x"], owned: ["chat", "fusee"],
    equipped: { hat: "forme", home: "chat" } }), 50, ITEMS);
  assert.deepStrictEqual(s, { coins: 1, solved: [3], owned: ["chat"], equipped: {} });
});

t("mode test : la solution fournie valide chacune des 50 énigmes", () => {
  PUZZLES.forEach((p, i) => assert.ok(G.checkAnswer(p, G.solutionFor(p)), "#" + (i + 1)));
  assert.strictEqual(G.TEST_PASSWORD, "tes1");
});

console.log(`\n${n} tests OK`);
