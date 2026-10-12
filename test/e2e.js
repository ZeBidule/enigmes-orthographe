/* Test de bout en bout dans un vrai navigateur (Chromium via Playwright).
   Lancer : npx -y playwright install chromium   (une seule fois)
            PLAYWRIGHT=$(dirname $(find ~/.npm/_npx -path '*node_modules/playwright/package.json' | head -1)) node test/e2e.js
   Démarre un petit serveur local, joue, sauvegarde dans un fichier, recharge ce fichier dans un navigateur vierge. */
const assert = require("assert");
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const root = path.join(__dirname, "..");

const server = http.createServer((req, res) => {
  const f = path.join(root, req.url === "/" ? "index.html" : req.url.split("?")[0]);
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": f.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); res.end(data); });
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const open = async () => {
    const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 412, height: 900 } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(e.message));
    p.on("dialog", d => d.accept());
    await p.goto(url);
    return p;
  };

  // 1. Écran titre
  let p = await open();
  assert.strictEqual(await p.textContent(".title-logo .t1"), "Plume & Cie");
  assert.match(await p.textContent(".title-buttons"), /Nouvelle enquête/);
  console.log("ok - écran titre (nouvelle partie)");

  // 2. Jouer : résoudre le mystère 1 en touchant les 3 fautes, puis acheter un objet
  await p.click("text=Nouvelle enquête");
  await p.click("text=Mystère 1");
  // touche chaque mot fautif (marqué [faute|correction] dans les données)
  const badIdx = await p.evaluate(() => PUZZLES[0].text.split(" ").map((w, i) => w.startsWith("[") ? i : -1).filter(i => i >= 0));
  assert.strictEqual(badIdx.length, 3);
  for (const i of badIdx) await p.locator(".w").nth(i).click();
  await p.click("text=Valider");
  assert.strictEqual(await p.textContent(".big"), "Bravo !");
  await p.click(".overlay >> text=Maison");
  await p.click("text=Boutique");
  await p.click(".shop-item:has-text('Nœud papillon') button");
  const coins = await p.evaluate(() => JSON.parse(localStorage.getItem("plume-save-v2")).coins);
  assert.strictEqual(coins, 5 + 15 - 20);
  console.log("ok - partie jouée : mystère 1 résolu, nœud papillon acheté");

  // 3. Sauvegarder dans un fichier
  await p.click("text=⟵ Maison");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("text=💾 Sauvegarder")]);
  const file = path.join(os.tmpdir(), dl.suggestedFilename());
  await dl.saveAs(file);
  const content = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.match(dl.suggestedFilename(), /^plume-et-cie-sauvegarde-\d{4}-\d\d-\d\d\.json$/);
  assert.deepStrictEqual([content.solved, content.owned, content.equipped, content.coins], [["p01"], ["noeud"], { neck: "noeud" }, 0]);
  console.log("ok - fichier téléchargé :", dl.suggestedFilename());

  // 4. Navigateur vierge (autre appareil) : charger le fichier depuis l'écran titre
  p = await open();
  assert.match(await p.textContent(".title-buttons"), /Nouvelle enquête/);
  const [chooser] = await Promise.all([p.waitForEvent("filechooser"), p.click("text=Charger une sauvegarde")]);
  await chooser.setFiles(file);
  await p.waitForSelector(".progress");
  assert.match(await p.textContent("body"), /1 \/ 90 mystères résolus/);
  assert.match(await p.textContent(".money"), /0 écus/);
  assert.ok(await p.$("text=Mystère 2"), "mystère 2 débloqué");
  await p.click("text=Boutique");
  assert.strictEqual(await p.textContent(".shop-item:has-text('Nœud papillon') button"), "Retirer");
  console.log("ok - sauvegarde rechargée dans un navigateur vierge (mystères + objets portés)");

  // 5. Fichier invalide : message d'erreur, progression intacte
  const badFile = path.join(os.tmpdir(), "pas-une-sauvegarde.json");
  fs.writeFileSync(badFile, '{"hello":1}');
  let alertMsg = "";
  p.removeAllListeners("dialog");
  p.on("dialog", d => { alertMsg = d.message(); d.accept(); });
  await p.click("text=⟵ Maison");
  const [ch2] = await Promise.all([p.waitForEvent("filechooser"), p.click("text=📂 Charger")]);
  await ch2.setFiles(badFile);
  await p.waitForTimeout(500);
  assert.match(alertMsg, /pas une sauvegarde/);
  assert.match(await p.textContent("body"), /1 \/ 90 mystères résolus/);
  console.log("ok - fichier invalide refusé, progression conservée");

  // 6. Écran titre en mode "Continuer"
  await p.reload();
  assert.match(await p.textContent(".title-buttons"), /Continuer/);
  console.log("ok - écran titre (continuer)");

  // 7. Menu de test : ni raccourci ni appuis sur le titre ; bouton 🔑 du menu principal
  await p.evaluate(() => G.home());
  await p.keyboard.press("Control+Shift+T");
  for (let k = 0; k < 5; k++) await p.click("header h1");
  assert.strictEqual(await p.$("#test-pwd"), null, "aucun menu sans le bouton");
  assert.ok(await p.$(".progress"), "toujours sur l'écran maison");
  await p.click("text=⟵ Menu principal");
  await p.click(".key-btn");
  await p.waitForSelector("#test-pwd");
  await p.fill("#test-pwd", "faux");
  await p.click("text=Déverrouiller");
  assert.strictEqual(await p.textContent("#test-err"), "Mot de passe incorrect.");
  await p.fill("#test-pwd", "tes1");
  await p.press("#test-pwd", "Enter");
  await p.waitForSelector(".test-badge");
  assert.match(await p.textContent(".money"), /∞/);
  console.log("ok - raccourci et appuis sur le titre inactifs ; bouton 🔑 + mot de passe vérifié");

  // 8. Tous les mystères débloqués
  await p.click("text=📜 Mystères");
  assert.strictEqual(await p.$$eval(".grid button[disabled]", x => x.length), 0);
  console.log("ok - 90 mystères débloqués");

  // 9. Bouton Solution sur les 3 types (find, fill, type) + mystère 50
  const picks = await p.evaluate(() => ["find", "fill", "type"].map(t => PUZZLES.findIndex(x => x.t === t)).concat(PUZZLES.length - 1));
  for (const i of picks) {
    await p.evaluate(i => { G.close(); G.start(i); }, i);
    await p.click("text=🧪 Solution");
    assert.strictEqual(await p.textContent(".big"), "Bravo !", "mystère " + (i + 1));
  }
  await p.evaluate(() => G.close());
  console.log("ok - bouton Solution valide les mystères (3 types)");

  // 10. Écus illimités : achat sans débit
  const before = await p.evaluate(() => JSON.parse(localStorage.getItem("plume-save-v2")).coins);
  await p.evaluate(() => G.shop());
  await p.click(".shop-item:has-text('Chat de compagnie') button");
  const after = await p.evaluate(() => JSON.parse(localStorage.getItem("plume-save-v2")));
  assert.ok(after.owned.includes("chat"));
  assert.strictEqual(after.coins, before);
  await p.click(".shop-item:has-text('Montgolfière') button");
  const g = await p.evaluate(() => JSON.parse(localStorage.getItem("plume-save-v2")));
  assert.ok(g.owned.includes("ballon") && g.coins === before);
  await p.evaluate(() => G.home());
  assert.strictEqual(await p.$$eval(".scene svg", x => x.length), 2, "maison + jardin affichés");
  assert.ok(await p.$("svg[aria-label^='Le jardin']"));
  console.log("ok - achats chat (150) et montgolfière (400) sans débit ; maison + jardin affichés");

  // 11. Désactivation depuis le bouton 🔑
  await p.evaluate(() => G.title());
  await p.click(".key-btn");
  await p.click("text=Désactiver le mode test");
  await p.evaluate(() => G.home());
  assert.strictEqual(await p.$(".test-badge"), null);
  await p.evaluate(() => G.list());
  assert.ok(await p.$$eval(".grid button[disabled]", x => x.length) > 0);
  console.log("ok - désactivation par le bouton 🔑 re-verrouille");

  // 12. Ancienne sauvegarde du navigateur (version 50 énigmes, progression par position)
  await p.evaluate(() => localStorage.setItem("plume-save-v2", JSON.stringify({ coins: 33, solved: [0, 1, 2], owned: ["tapis"], equipped: {} })));
  await p.reload();
  await p.click("text=Continuer");
  assert.match(await p.textContent("body"), /3 \/ 90 mystères résolus/);
  const migrated = await p.evaluate(() => { G.list(); return [...document.querySelectorAll(".grid button")].filter(b => b.textContent.startsWith("✔")).length; });
  assert.strictEqual(migrated, 3);
  console.log("ok - ancienne sauvegarde du navigateur reprise (3 mystères, écus et objets conservés)");

  assert.deepStrictEqual(errors, [], "erreurs JS");
  console.log("\nTests navigateur OK");
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
